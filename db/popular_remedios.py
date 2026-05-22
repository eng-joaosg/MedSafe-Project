import pg8000
from datetime import datetime

# -----------------------
# Configurações do banco
# -----------------------
DB_NAME = 
DB_USER = 
DB_PASSWORD = 
DB_HOST = "localhost"
DB_PORT = 5432

# -----------------------
# Lista completa de medicamentos
# -----------------------
medicamentos = [
    # Analgésicos e anti-inflamatórios
    ("Paracetamol", "Analgésico e antipirético"),
    ("Ibuprofeno", "Anti-inflamatório não esteroidal"),
    ("Naproxeno", "Anti-inflamatório não esteroidal"),
    ("Diclofenaco", "Anti-inflamatório não esteroidal"),
    ("AAS (Ácido Acetilsalicílico)", "Analgésico e anti-inflamatório"),
    
    # Antibióticos
    ("Amoxicilina", "Antibiótico penicilínico"),
    ("Azitromicina", "Antibiótico macrolídeo"),
    ("Cefalexina", "Antibiótico cefalosporínico"),
    ("Ciprofloxacino", "Antibiótico fluoroquinolona"),
    ("Claritromicina", "Antibiótico macrolídeo"),

    # Anti-hipertensivos
    ("Losartana", "Antagonista dos receptores de angiotensina II"),
    ("Enalapril", "Inibidor da enzima conversora de angiotensina"),
    ("Atenolol", "Betabloqueador"),
    ("Metoprolol", "Betabloqueador"),

    # Diabetes
    ("Metformina", "Hipoglicemiante oral, diabetes tipo 2"),
    ("Insulina NPH", "Insulina de ação intermediária"),
    ("Insulina Regular", "Insulina de ação rápida"),
    ("Glipizida", "Hipoglicemiante oral, sulfonilureia"),
    
    # Respiratórios
    ("Salbutamol", "Broncodilatador, asma e DPOC"),
    ("Budesonida", "Corticosteroide inalatório"),
    ("Fluticasona", "Corticosteroide inalatório"),
    ("Formoterol", "Broncodilatador de longa duração"),
    ("Salmeterol", "Broncodilatador de longa duração"),
    
    # Câncer
    ("Cisplatina", "Quimioterápico"),
    ("Doxorrubicina", "Quimioterápico"),
    ("Paclitaxel", "Quimioterápico"),
    ("Tamoxifeno", "Terapia hormonal, câncer de mama"),
    ("Imatinibe", "Inibidor de tirosina quinase"),
    ("Trastuzumabe", "Anticorpo monoclonal, câncer de mama"),
    ("Rituximabe", "Anticorpo monoclonal, linfoma"),
    ("Bevacizumabe", "Anticorpo monoclonal, diversos cânceres"),
    ("Fluorouracil", "Quimioterápico"),
    ("Etoposídeo", "Quimioterápico"),

    # HIV e similares
    ("Tenofovir", "Antirretroviral"),
    ("Lamivudina", "Antirretroviral"),
    ("Efavirenz", "Antirretroviral"),
    ("Dolutegravir", "Antirretroviral"),
    ("Atazanavir", "Antirretroviral"),

    # Neurológicos e psiquiátricos
    ("Alprazolam", "Ansiolítico benzodiazepínico"),
    ("Clonazepam", "Ansiolítico e anticonvulsivante"),
    ("Lorazepam", "Ansiolítico benzodiazepínico"),
    ("Buspirona", "Ansiolítico não benzodiazepínico"),
    ("Sertralina", "Antidepressivo ISRS, ansiedade e depressão"),
    ("Fluoxetina", "Antidepressivo ISRS"),
    ("Citalopram", "Antidepressivo ISRS"),
    ("Escitalopram", "Antidepressivo ISRS"),
    ("Paroxetina", "Antidepressivo ISRS"),
    ("Venlafaxina", "Antidepressivo SNRI"),
    ("Duloxetina", "Antidepressivo SNRI"),
    ("Amitriptilina", "Antidepressivo tricíclico"),
    ("Nortriptilina", "Antidepressivo tricíclico"),
    ("Lithium Carbonate", "Estabilizador de humor, transtorno bipolar"),
    ("Valproato de sódio", "Estabilizador de humor e anticonvulsivante"),
    ("Carbamazepina", "Estabilizador de humor e anticonvulsivante"),
    ("Lamotrigina", "Anticonvulsivante e estabilizador de humor"),
    ("Levetiracetam", "Anticonvulsivante"),
    ("Topiramato", "Anticonvulsivante e prevenção de enxaqueca"),
    ("Gabapentina", "Anticonvulsivante e neuropatia"),

    # Outros gerais 
    ("Omeprazol", "Inibidor da bomba de prótons, refluxo e gastrite"),
    ("Pantoprazol", "Inibidor da bomba de prótons"),
    ("Clopidogrel", "Antiplaquetário"),
    ("Aspirina", "Anti-inflamatório e antiplaquetário"),
    ("Atorvastatina", "Redução de colesterol"),
    ("Simvastatina", "Redução de colesterol"),
    ("Furosemida", "Diurético de alça"),
    ("Hidroclorotiazida", "Diurético tiazídico"),
    ("Prednisona", "Corticosteroide"),
    ("Metilprednisolona", "Corticosteroide"),
    ("Levotiroxina", "Hormônio da tireoide"),
    ("Ranitidina", "Antagonista H2, gastrite"),
    ("Cetirizina", "Antihistamínico"),
    ("Loratadina", "Antihistamínico"),
    ("Montelucaste", "Antileucotrieno, asma")
]

# -----------------------
# Inserção no banco
# -----------------------
try:
    conn = pg8000.connect(user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT, database=DB_NAME)
    cursor = conn.cursor()

    for nome, descricao in medicamentos:
        cursor.execute(
            "INSERT INTO medication (name, description, created_at, updated_at) VALUES (%s, %s, %s, %s)",
            (nome, descricao, datetime.now(), datetime.now())
        )

    conn.commit()
    print(f"{len(medicamentos)} medicamentos inseridos com sucesso!")

except Exception as e:
    print("Erro ao inserir medicamentos:", e)

finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
