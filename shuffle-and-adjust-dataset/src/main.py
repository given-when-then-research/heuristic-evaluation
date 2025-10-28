import json
import pandas as pd
from pathlib import Path
import argparse
import math

def calculate_sample_size(
    population_size: int,
    confidence_level: float = 0.95,
    margin_of_error: float = 0.05,
    proportion: float = 0.5
) -> int:
    """
    Calcula o tamanho da amostra necessário usando a fórmula estatística.
    
    Args:
        population_size: Tamanho total da população
        confidence_level: Nível de confiança (padrão: 0.95 = 95%)
        margin_of_error: Margem de erro (padrão: 0.05 = 5%)
        proportion: Proporção esperada (padrão: 0.5 = pior caso)
    
    Returns:
        Tamanho da amostra calculado
    
    Fórmula: n = (Z² × p × (1 − p)) / e²
    Com correção para população finita: n_adjusted = n / (1 + (n - 1) / N)
    """
    # Z-scores para níveis de confiança comuns
    z_scores = {
        0.90: 1.645,
        0.95: 1.96,
        0.99: 2.576
    }
    
    z = z_scores.get(confidence_level)
    if z is None:
        raise ValueError(
            f"Confidence level {confidence_level} não suportado. "
            f"Use 0.90, 0.95 ou 0.99"
        )
    
    # Fórmula básica para população infinita
    n = (z ** 2 * proportion * (1 - proportion)) / (margin_of_error ** 2)
    
    # Correção para população finita (quando a amostra é significativa em relação à população)
    if population_size > 0:
        n_adjusted = n / (1 + (n - 1) / population_size)
        return math.ceil(n_adjusted)
    
    calculate_sample_size_value =  math.ceil(n)
    
    return calculate_sample_size_value 


def load_dataset(path: Path) -> pd.DataFrame:
    """Carrega o dataset JSON como DataFrame."""
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return pd.DataFrame(data)


def shuffle_dataframe(df: pd.DataFrame, seed: int = 42) -> pd.DataFrame:
    """
    Embaralha o DataFrame.
    
    Args:
        df: DataFrame a ser embaralhado
        seed: Seed para reprodutibilidade
    
    Returns:
        DataFrame embaralhado
    """
    return df.sample(frac=1, random_state=seed).reset_index(drop=True)


def adjust_dataset(data: list) -> list:
    """
    Transforma o dataset selecionando o melhor match por confiança.
    
    Args:
        data: Lista de entradas do dataset original
    
    Returns:
        Lista transformada com apenas o melhor match
    """
    transformed_data = []
    
    for entry in data:
        if not entry.get("used_in"):
            continue  # pula se não houver correspondência
        
        # Seleciona o item com maior confidence
        best_match = max(entry["used_in"], key=lambda x: x["confidence"])
        
        transformed_entry = {
            "repository": entry["repository"],
            "language": entry["language"],
            "feature_file": entry["feature_file"],
            "matched_file": best_match["file"],
            "confidence": best_match["confidence"],
            "reasons": best_match["reasons"],
            "feature_content": entry.get("feature_content", ""),
            "matched_content": entry.get("matched_content", "")
        }
        
        transformed_data.append(transformed_entry)
    
    return transformed_data


def process_dataset(
    input_path: Path,
    output_path: Path,
    n: int = None,
    seed: int = 42,
    auto_calculate: bool = False,
    confidence_level: float = 0.95,
    margin_of_error: float = 0.05
):
    """
    Processa o dataset: carrega, embaralha, ajusta e gera subset.
    
    Args:
        input_path: Caminho do arquivo JSON de entrada
        output_path: Caminho do arquivo JSON de saída
        n: Número de linhas para o subset final (None para cálculo automático)
        seed: Seed para reprodutibilidade do embaralhamento
        auto_calculate: Se True, calcula automaticamente o tamanho da amostra
        confidence_level: Nível de confiança para cálculo automático
        margin_of_error: Margem de erro para cálculo automático
    """
    print(f"Carregando dataset de: {input_path}")
    df = load_dataset(input_path)
    total_pairs = len(df)
    print(f"Total de pares de arquivos: {total_pairs}")
    
    # Calcula tamanho da amostra se necessário
    if auto_calculate or n is None:
        n = calculate_sample_size(
            population_size=total_pairs,
            confidence_level=confidence_level,
            margin_of_error=margin_of_error
        )
        
        '''
        o calculate_sample_size implementado está sempre gerando o valor + 1 se comparado a referência
        https://www.surveysystem.com/sscalc.htm
        
        '''
        n = n - 1
        
        print(f"\n📊 Cálculo de amostra:")
        print(f"  - População total: {total_pairs}")
        print(f"  - Nível de confiança: {confidence_level*100}%")
        print(f"  - Margem de erro: {margin_of_error*100}%")
        print(f"  - Tamanho da amostra calculado: {n}")
    
    # Embaralha o dataset
    print(f"\nEmbaralhando dataset com seed={seed}...")
    df_shuffled = shuffle_dataframe(df, seed=seed)
    
    # Limita ao tamanho solicitado
    if n > total_pairs:
        print(f"AVISO: n={n} é maior que o total de pares ({total_pairs}). Usando todos os pares.")
        n = total_pairs
    
    print(f"Selecionando os primeiros {n} pares...")
    df_subset = df_shuffled.iloc[:n]
    
    # Converte de volta para lista de dicionários
    subset_list = df_subset.to_dict(orient="records")
    
    # Aplica os ajustes (seleciona melhor match)
    print("Aplicando ajustes (selecionando melhor match por confiança)...")
    adjusted_data = adjust_dataset(subset_list)
    
    print(f"Pares após ajuste: {len(adjusted_data)}")
    
    # Salva o resultado
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(adjusted_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Dataset processado salvo em: {output_path}")
    print(f"  - Total original: {total_pairs}")
    print(f"  - Subset solicitado: {n}")
    print(f"  - Pares finais (após filtrar sem matches): {len(adjusted_data)}")


def main():
    parser = argparse.ArgumentParser(
        description="Embaralha dataset, calcula/define tamanho de amostra e ajusta mantendo apenas o melhor match",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos de uso:

  # Cálculo automático de amostra (95% confiança, 5% erro)
  python script.py -i input.json -o output.json --auto

  # Cálculo automático com parâmetros customizados
  python script.py -i input.json -o output.json --auto --confidence 0.99 --error 0.03

  # Tamanho manual
  python script.py -i input.json -o output.json -n 348

  # Com seed customizada
  python script.py -i input.json -o output.json -n 500 -s 123
        """
    )
    
    parser.add_argument(
        "-i", "--input",
        type=str,
        required=True,
        help="Caminho do arquivo JSON de entrada"
    )
    parser.add_argument(
        "-o", "--output",
        type=str,
        required=True,
        help="Caminho do arquivo JSON de saída"
    )
    parser.add_argument(
        "-n", "--size",
        type=int,
        default=None,
        help="Número de pares no subset final (ignore para cálculo automático)"
    )
    parser.add_argument(
        "-s", "--seed",
        type=int,
        default=42,
        help="Seed para reprodutibilidade (padrão: 42)"
    )
    parser.add_argument(
        "--auto",
        action="store_true",
        help="Calcula automaticamente o tamanho da amostra"
    )
    parser.add_argument(
        "--confidence",
        type=float,
        default=0.95,
        choices=[0.90, 0.95, 0.99],
        help="Nível de confiança para cálculo automático (padrão: 0.95)"
    )
    parser.add_argument(
        "--error",
        type=float,
        default=0.05,
        help="Margem de erro para cálculo automático (padrão: 0.05 = 5%%)"
    )
    
    args = parser.parse_args()
    
    # Valida argumentos
    if not args.auto and args.size is None:
        parser.error("Você deve especificar --auto para cálculo automático OU -n/--size para tamanho manual")
    
    input_path = Path(args.input)
    output_path = Path(args.output)
    
    if not input_path.exists():
        print(f"ERRO: Arquivo de entrada não encontrado: {input_path}")
        return
    
    # Cria diretório de saída se não existir
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    process_dataset(
        input_path=input_path,
        output_path=output_path,
        n=args.size,
        seed=args.seed,
        auto_calculate=args.auto,
        confidence_level=args.confidence,
        margin_of_error=args.error
    )


if __name__ == "__main__":
    main()