
# Shuffle and Adjusts Dataset

This module generates **shuffled subsets** of the dataset for **manual analysis and validation**.
It supports two main sampling modes:

* **Automatic (`make auto`)** — calculates the sample size automatically using **sscalc** (based on dataset size).
* **Manual (`make manual SIZE=...`)** — lets you manually define the sample size.

The generated dataset is used in the **Gherkin Match Pairs** for human evaluation.

---

## Installation

Clone the repository and create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Input and Output Configuration

Before running, edit the paths in your `Makefile` according to the dataset you want to evaluate:

```make
# Default paths (edit as needed)
INPUT  = ../../step-definitions-extraction-heuristic/output/exploitation.json
OUTPUT = ../../dataset/exploitation-to-evaluation.json
```

You can also **override** these variables directly in the command line without editing the file:

```bash
make auto  INPUT=../out/exploitation.json  OUTPUT=./output/eval-sample.json
make manual SIZE=350 INPUT=../out/exploration.json OUTPUT=./output/exploration-eval.json
```

---

## Execution

### 1. Automatic sample calculation (`sscalc`)

Uses statistical sampling (sscalc) to automatically determine an appropriate sample size.

```bash
make auto
# or with custom paths
make auto INPUT=../out/exploitation.json OUTPUT=./output/exploitation-eval.json
```

**Process:**

* Reads the dataset from `INPUT`
* Computes the sample size automatically
* Shuffles the dataset
* Saves the sample to `OUTPUT`

---

### 2. Manual sample size

You can specify the sample size manually with the `SIZE` variable.

```bash
# Example: 348 items
make manual SIZE=348
# With custom paths
make manual SIZE=348 INPUT=../out/exploration.json OUTPUT=./output/exploration-eval.json
```

**Process:**

* Reads the dataset from `INPUT`
* Randomly shuffles the data
* Selects the first `SIZE` items
* Saves the sample to `OUTPUT`

---