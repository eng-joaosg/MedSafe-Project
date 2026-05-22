import subprocess
import sys

scripts = [
    "criar_banco.py",
    "popular_doencas.py",
    "popular_alergias.py",
    "popular_remedios.py",
    "popular_cirurgias.py"
]

for script in scripts:
    print(f"\nExecutando {script}...\n")
    try:
        result = subprocess.run([sys.executable, script], check=True)
        print(f"{script} executado com sucesso!")
    except subprocess.CalledProcessError as e:
        print(f"Erro ao executar {script}: {e}")
        break
