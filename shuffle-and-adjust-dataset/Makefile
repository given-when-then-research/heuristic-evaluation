# Configurações
PYTHON = python3
SCRIPT = src/main.py
INPUT = ../../step-definitions-extraction-heuristic/output/exploitation.json
OUTPUT = ../../dataset/exploitation-to-evaluation.json
SEED = 42

# Cálculo automático de amostra (95% confiança, 5% erro)
auto:
	$(PYTHON) $(SCRIPT) -i $(INPUT) -o $(OUTPUT) --auto -s $(SEED)

# Cálculo automático estrito (99% confiança, 3% erro)
auto-strict:
	$(PYTHON) $(SCRIPT) -i $(INPUT) -o $(OUTPUT) --auto --confidence 0.99 --error 0.03 -s $(SEED)

# Tamanho manual - uso: make manual SIZE=348
manual:
	$(PYTHON) $(SCRIPT) -i $(INPUT) -o $(OUTPUT) -n $(SIZE) -s $(SEED)

# Verifica arquivo de entrada
check:
	@test -f $(INPUT) && echo "✓ Arquivo encontrado" || echo "✗ Arquivo não encontrado"
	@test -f $(SCRIPT) && echo "✓ Script encontrado" || echo "✗ Script não encontrado"

# Mostra info do dataset
info:
	@$(PYTHON) -c "import json; data=json.load(open('$(INPUT)')); print(f'Total: {len(data)} pares')"

# Limpa arquivos de saída
clean:
	rm -f $(OUTPUT)

# Instala dependências
install:
	$(PYTHON) -m pip install pandas

.PHONY: auto auto-strict manual check info clean install