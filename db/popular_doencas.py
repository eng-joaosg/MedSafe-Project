import pg8000
from datetime import datetime

# Configurações do banco
DB_NAME = 
DB_USER = 
DB_PASSWORD = 
DB_HOST = "localhost"
DB_PORT = 5432

# Lista completa de doenças crônicas
doencas = [
    # Endócrinas e metabólicas
    ("Hipertensão essencial (primária)", "Pressão arterial elevada sem causa conhecida", "I10"),
    ("Hipertensão intracraneana", "Aumento crônico da pressão dentro do crânio", "G93.2"),
    ("Diabetes mellitus tipo 1", "Distúrbio autoimune com hiperglicemia", "E10"),
    ("Diabetes mellitus tipo 2", "Distúrbio metabólico com hiperglicemia", "E11"),
    ("Hipotireoidismo", "Produção insuficiente de hormônios da tireoide", "E03"),
    ("Hipertireoidismo", "Produção excessiva de hormônios da tireoide", "E05"),
    ("Obesidade grau II e III", "Excesso de gordura corporal com risco elevado", "E66.0"),
    ("Osteoporose", "Perda de densidade óssea aumentando risco de fraturas", "M81"),

    # Cardiovasculares
    ("Insuficiência cardíaca", "Incapacidade do coração de bombear sangue adequadamente", "I50"),
    ("Doença arterial coronariana crônica", "Redução crônica do fluxo sanguíneo coronário", "I25"),

    # Respiratórias crônicas
    ("Asma grave", "Doença inflamatória crônica das vias respiratórias", "J45"),
    ("Doença pulmonar obstrutiva crônica (DPOC)", "Doença pulmonar crônica obstrutiva", "J44"),
    ("Fibrose pulmonar idiopática", "Doença pulmonar progressiva e crônica", "J84.112"),
    ("Bronquite crônica", "Inflamação persistente dos brônquios", "J41"),
    ("Bronquiectasia", "Dilatação crônica e irreversível dos brônquios", "J47"),
    ("Síndrome de hipoventilação alveolar", "Comprometimento respiratório crônico", "J96.2"),
    ("Apneia obstrutiva do sono grave", "Interrupção crônica da respiração durante o sono", "G47.3"),

    # Neurológicas
    ("Doença de Alzheimer", "Demência progressiva associada à idade", "G30"),
    ("Esclerose múltipla", "Doença autoimune do sistema nervoso central", "G35"),
    ("Doença de Parkinson", "Distúrbio neurodegenerativo progressivo", "G20"),
    ("Epilepsia crônica", "Transtorno neurológico com crises recorrentes", "G40"),
    ("Autismo", "Transtorno do desenvolvimento neurológico", "F84.0"),
    ("Enxaqueca crônica", "Dor de cabeça recorrente e intensa", "G43"),

    # Musculoesqueléticas
    ("Osteoartrite", "Doença degenerativa das articulações", "M19"),
    ("Artrite reumatoide", "Doença autoimune das articulações", "M06"),
    ("Escoliose torácica", "Curvatura anormal da coluna torácica", "M41.2"),
    ("Escoliose lombar", "Curvatura anormal da coluna lombar", "M41.3"),
    ("Escoliose toracolombar", "Curvatura anormal da coluna toracolombar", "M41.1"),
    ("Lombalgia crônica", "Dor persistente na região lombar", "M54.5"),

    # Hematológicas
    ("Anemia ferropriva crônica", "Deficiência de ferro prolongada causando anemia", "D50"),

    # Autoimunes
    ("Lúpus eritematoso sistêmico", "Doença autoimune crônica", "M32"),

    # Psiquiátricas
    ("Depressão maior", "Transtorno do humor com tristeza persistente", "F32"),

    # Infecciosas crônicas
    ("HIV", "Infecção crônica pelo vírus da imunodeficiência humana", "B20"),
    ("Hepatite B crônica", "Infecção crônica pelo vírus da hepatite B", "B18.1"),
    ("Hepatite C crônica", "Infecção crônica pelo vírus da hepatite C", "B18.2"),
    ("Hanseníase (Lepra)", "Doença infecciosa crônica da pele e nervos", "A30"),

    # Dermatológicas
    ("Psoríase", "Doença inflamatória crônica da pele", "L40"),
    ("Vitiligo", "Doença autoimune da pigmentação da pele", "L80"),

    # Oculares
    ("Glaucoma crônico", "Doença ocular com aumento da pressão intraocular", "H40"),

    # Renais
    ("Doença renal crônica", "Perda progressiva da função renal", "N18"),
    ("Insuficiência renal crônica", "Perda progressiva da função renal", "N18"),
    ("Doença policística renal", "Formação de múltiplos cistos nos rins", "Q61.3"),
    ("Glomerulonefrite crônica", "Inflamação crônica dos glomérulos renais", "N03"),

    # Gastrointestinais e hepáticas
    ("Doença de Crohn", "Inflamação crônica do trato gastrointestinal", "K50"),
    ("Retocolite ulcerativa", "Inflamação crônica do cólon e reto", "K51"),
    ("Cirrose hepática", "Fibrose crônica do fígado", "K74"),
    ("Gastrite atrófica crônica", "Inflamação crônica da mucosa gástrica", "K29.4"),

    # Autoimunes adicionais
    ("Esclerodermia", "Doença autoimune crônica da pele e órgãos internos", "M34"),
    ("Síndrome de Sjögren", "Doença autoimune que afeta glândulas exócrinas", "M35.0"),
    ("Tireoidite de Hashimoto", "Inflamação autoimune da tireoide", "E06.3"),
    ("Doença celíaca", "Intolerância autoimune ao glúten", "K90.0"),
    ("Colite ulcerativa crônica", "Inflamação crônica do cólon", "K51.9"),

    # Cânceres (24 tipos)
    ("Câncer de mama", "Neoplasia maligna da mama", "C50"),
    ("Câncer de próstata", "Neoplasia maligna da próstata", "C61"),
    ("Câncer de pulmão", "Neoplasia maligna dos pulmões", "C34"),
    ("Câncer de cólon", "Neoplasia maligna do cólon", "C18"),
    ("Câncer de rim", "Neoplasia maligna do rim", "C64"),
    ("Câncer de fígado", "Neoplasia maligna do fígado", "C22"),
    ("Câncer de estômago", "Neoplasia maligna do estômago", "C16"),
    ("Câncer de pâncreas", "Neoplasia maligna do pâncreas", "C25"),
    ("Câncer de pele melanoma", "Neoplasia maligna da pele tipo melanoma", "C43"),
    ("Câncer de bexiga", "Neoplasia maligna da bexiga urinária", "C67"),
    ("Câncer de ovário", "Neoplasia maligna do ovário", "C56"),
    ("Câncer de esôfago", "Neoplasia maligna do esôfago", "C15"),
    ("Câncer de laringe", "Neoplasia maligna da laringe", "C32"),
    ("Câncer de tireoide", "Neoplasia maligna da tireoide", "C73"),
    ("Câncer de cérebro", "Neoplasia maligna do cérebro", "C71"),
    ("Câncer de bexiga renal", "Neoplasia maligna do trato urinário superior", "C66"),
    ("Câncer de colo uterino", "Neoplasia maligna do colo do útero", "C53"),
    ("Câncer de testículo", "Neoplasia maligna do testículo", "C62"),
    ("Câncer de pâncreas endócrino", "Neoplasia maligna das células endócrinas do pâncreas", "C25.4"),
    ("Câncer de boca e orofaringe", "Neoplasia maligna da boca e orofaringe", "C00-C14"),
    ("Câncer de lobo pulmonar", "Neoplasia maligna de um lobo do pulmão", "C34.9"),
    ("Câncer de pâncreas exócrino", "Neoplasia maligna do pâncreas exócrino", "C25.0"),
    ("Câncer de ovário mucinoso", "Neoplasia maligna do ovário tipo mucinoso", "C56.1"),
    ("Câncer de reto", "Neoplasia maligna do reto", "C20")
]

# Inserção no banco
try:
    conn = pg8000.connect(user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT, database=DB_NAME)
    cursor = conn.cursor()

    for nome, descricao, icd in doencas:
        cursor.execute(
            "INSERT INTO disease (name, description, icd_code, created_at, updated_at) VALUES (%s, %s, %s, %s, %s)",
            (nome, descricao, icd, datetime.now(), datetime.now())
        )

    conn.commit()
    print(f"{len(doencas)} doenças crônicas inseridas com sucesso!")

except Exception as e:
    print("Erro ao inserir doenças:", e)

finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
