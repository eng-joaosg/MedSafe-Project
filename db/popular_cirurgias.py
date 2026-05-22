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
# Lista de cirurgias
# -----------------------
cirurgias = [
    # Abdominais / gerais
    ("Apendicectomia", "Remoção do apêndice inflamado"),
    ("Colecistectomia", "Remoção da vesícula biliar"),
    ("Histerectomia", "Remoção do útero"),
    ("Cesárea", "Parto cirúrgico"),
    ("Colelitotomia", "Remoção de cálculos biliares"),
    ("Cirurgia de varizes", "Tratamento cirúrgico de varizes"),
    ("Cirurgia de hérnia inguinal", "Reparo de hérnia na região inguinal"),
    ("Cirurgia de hérnia umbilical", "Reparo de hérnia na região umbilical"),
    ("Gastrectomia parcial", "Ressecção parcial do estômago"),
    ("Gastrectomia total", "Ressecção total do estômago"),
    ("Cirurgia bariátrica (Bypass gástrico)", "Redução do estômago para perda de peso"),
    ("Cirurgia bariátrica (Sleeve gástrico)", "Redução do estômago em manga"),
    ("Cirurgia de colecistite aguda", "Tratamento cirúrgico da inflamação da vesícula"),
    ("Esplenectomia", "Remoção do baço"),
    ("Cirurgia de diverticulite", "Ressecção de segmento intestinal inflamado"),
    ("Hemorroidectomia", "Remoção cirúrgica de hemorroidas"),
    
    # Intestino
    ("Ressecção intestinal", "Remoção de segmento do intestino"),
    ("Colectomia", "Remoção parcial ou total do cólon"),
    ("Cirurgia de hemorroidas", "Tratamento cirúrgico de hemorroidas"),
    ("Cirurgia de intestino delgado", "Ressecção de segmento do intestino delgado"),
    
    # Coluna / coluna vertebral
    ("Cirurgia de coluna lombar", "Correção de hérnia de disco ou estabilização"),
    ("Laminectomia", "Remoção de parte da vértebra para descompressão nervosa"),
    ("Fusão espinhal", "Estabilização cirúrgica da coluna"),
    ("Discectomia cervical", "Remoção de disco cervical comprimindo nervo"),
    ("Vertebroplastia", "Injeção de cimento ósseo para fratura vertebral"),
    
    # Neurológicas
    ("Craniotomia", "Acesso cirúrgico ao cérebro"),
    ("Cirurgia de aneurisma cerebral", "Correção de aneurisma intracraniano"),
    ("Neurocirurgia de epilepsia", "Tratamento cirúrgico de epilepsia refratária"),
    ("Cirurgia de tumor cerebral", "Remoção de neoplasia cerebral"),
    ("Hidrocefalia - derivação ventricular", "Implantação de derivação para drenagem de líquido"),
    
    # Cardiovasculares
    ("Cirurgia cardíaca aberta", "Reparo de válvula ou artéria coronária"),
    ("Bypass coronário", "Revascularização do coração"),
    ("Angioplastia coronária", "Desobstrução de artéria coronária"),
    ("Cirurgia de aneurisma aórtico", "Correção cirúrgica de aneurisma da aorta"),
    
    # Oftalmológicas
    ("Cirurgia de catarata", "Substituição do cristalino opaco"),
    ("Cirurgia de glaucoma", "Redução da pressão intraocular"),
    ("Cirurgia refrativa a laser", "Correção da visão com laser"),
    ("Cirurgia de retina", "Tratamento cirúrgico da retina"),
    ("Timpanoplastia", "Reparação cirúrgica do tímpano"),
    ("Cirurgia de estrabismo", "Correção de desvio ocular"),
    
    # Urológicas / ginecológicas
    ("Cirurgia de varicocele", "Correção de dilatação venosa testicular"),
    ("Prostatectomia", "Remoção parcial ou total da próstata"),
    ("Orquiectomia", "Remoção de testículo"),
    ("Hernioplastia inguinal", "Reparo de hérnia inguinal"),
    ("Cirurgia de tireoide", "Ressecção parcial ou total da tireoide"),
    ("Paratiroidectomia", "Remoção de glândula paratireoide"),
    ("Mastectomia", "Remoção total ou parcial da mama"),
    ("Quadrantectomia", "Remoção parcial da mama"),
    ("Reconstrução mamária", "Reconstrução da mama após mastectomia"),
    ("Cirurgia de miomas uterinos", "Remoção de miomas do útero"),
    
    # Torácicas
    ("Toracotomia", "Acesso cirúrgico ao tórax"),
    ("Pneumonectomia", "Remoção de pulmão completo"),
    ("Lobectomia pulmonar", "Remoção de lobo do pulmão"),
    ("Cirurgia de mediastino", "Tratamento de tumores do mediastino"),
    
    # Ortopédicas adicionais
    ("Artroscopia de joelho", "Reparo articular do joelho por artroscopia"),
    ("Artroscopia de ombro", "Reparo articular do ombro por artroscopia"),
    ("Prótese de quadril", "Substituição da articulação do quadril"),
    ("Prótese de joelho", "Substituição da articulação do joelho"),
    ("Reconstrução do ligamento cruzado anterior (LCA)", "Reparo do LCA do joelho"),
    ("Osteotomia tibial", "Corte e realinhamento da tíbia"),
    ("Fixação de fratura de fêmur", "Tratamento cirúrgico de fratura do fêmur"),
    ("Fixação de fratura de úmero", "Tratamento cirúrgico de fratura do úmero"),
    ("Correção de escoliose", "Cirurgia para corrigir curvatura anormal da coluna"),
    ("Descompressão lombar", "Alívio cirúrgico de compressão nervosa na lombar"),
    ("Cirurgia de ombro (reparo de manguito rotador)", "Reconstrução cirúrgica do manguito rotador"),
    ("Artrodese do tornozelo", "Fusão cirúrgica das articulações do tornozelo"),
    ("Reconstrução de cotovelo", "Reparo cirúrgico do cotovelo"),
    ("Cirurgia de pé plano", "Correção cirúrgica do pé plano"),
    ("Cirurgia de mão (tenossinovite)", "Tratamento cirúrgico de tendinite na mão")
]

# -----------------------
# Inserção no banco
# -----------------------
try:
    conn = pg8000.connect(user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT, database=DB_NAME)
    cursor = conn.cursor()

    for nome, descricao in cirurgias:
        cursor.execute(
            "INSERT INTO surgery (name, description, created_at, updated_at) VALUES (%s, %s, %s, %s)",
            (nome, descricao, datetime.now(), datetime.now())
        )

    conn.commit()
    print(f"{len(cirurgias)} cirurgias inseridas com sucesso!")

except Exception as e:
    print("Erro ao inserir cirurgias:", e)

finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
