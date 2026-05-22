import pg8000
from datetime import datetime
from pprint import pprint

# -----------------------
# Configurações do banco
# -----------------------
DB_NAME = 
DB_USER = 
DB_PASSWORD = 
DB_HOST = 
DB_PORT = 5432

def fetch_all_clinical_info():
    try:
        conn = pg8000.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME
        )
        cursor = conn.cursor()

        # Pegar todos os clinical_info
        cursor.execute("""
            SELECT 
                id, first_name, last_name, blood_type, sex, date_of_birth, public_code, other_info,
                created_at, updated_at
            FROM clinical_info;
        """)
        rows = cursor.fetchall()

        clinical_infos = []

        for row in rows:
            cid = row[0]
            info = {
                "id": str(cid),
                "first_name": row[1],
                "last_name": row[2],
                "blood_type": row[3],
                "sex": row[4],
                "date_of_birth": row[5].isoformat() if row[5] else None,
                "public_code": row[6],
                "other_info": row[7],
                "created_at": row[8].isoformat() if row[8] else None,
                "updated_at": row[9].isoformat() if row[9] else None,
                "allergies": [],
                "diseases": [],
                "medications": [],
                "surgeries": [],
                "contacts": []
            }

            # --- Allergies ---
            cursor.execute("""
                SELECT a.name, cia.severity
                FROM clinical_info_allergy cia
                JOIN allergy a ON cia.allergy_id = a.id
                WHERE cia.clinical_info_id = %s;
            """, (cid,))
            info["allergies"] = [{"name": r[0], "severity": r[1]} for r in cursor.fetchall()]

            # --- Diseases ---
            cursor.execute("""
                SELECT d.name
                FROM clinical_info_disease cid
                JOIN disease d ON cid.disease_id = d.id
                WHERE cid.clinical_info_id = %s;
            """, (cid,))
            info["diseases"] = [r[0] for r in cursor.fetchall()]

            # --- Medications ---
            cursor.execute("""
                SELECT m.name, cim.dosage, cim.usage_interval
                FROM clinical_info_medication cim
                JOIN medication m ON cim.medication_id = m.id
                WHERE cim.clinical_info_id = %s;
            """, (cid,))
            info["medications"] = [{"name": r[0], "dosage": r[1], "usageInterval": r[2]} for r in cursor.fetchall()]

            # --- Surgeries ---
            cursor.execute("""
                SELECT s.name
                FROM clinical_info_surgery cis
                JOIN surgery s ON cis.surgery_id = s.id
                WHERE cis.clinical_info_id = %s;
            """, (cid,))
            info["surgeries"] = [r[0] for r in cursor.fetchall()]

            # --- Emergency Contacts ---
            cursor.execute("""
                SELECT id, first_name, last_name, ddd, phone, relationship
                FROM emergency_contact
                WHERE clinical_info_id = %s
                ORDER BY id;
            """, (cid,))
            info["contacts"] = [
                {"id": r[0], "firstName": r[1], "lastName": r[2], "ddd": r[3], "phone": r[4], "relationship": r[5]}
                for r in cursor.fetchall()
            ]

            clinical_infos.append(info)

        return clinical_infos

    except Exception as e:
        print("Erro ao buscar clinical_info:", e)
        return []

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


if __name__ == "__main__":
    infos = fetch_all_clinical_info()
    print(f"\nTotal de clinical_info: {len(infos)}\n")
    
    for idx, info in enumerate(infos, start=1):
        print(f"--- Clinical Info #{idx} ---")
        print(f"ID: {info['id']}")
        print(f"Nome: {info['first_name']} {info['last_name']}")
        print(f"Data de Nascimento: {info['date_of_birth']}")
        print(f"Tipo Sanguíneo: {info['blood_type']}, Sexo: {info['sex']}")
        print(f"Código Público: {info['public_code']}")
        print(f"Outras Informações: {info['other_info']}")
        print(f"Criado em: {info['created_at']}, Atualizado em: {info['updated_at']}\n")
        
        print("Alergias:")
        pprint(info['allergies'], indent=4)
        
        print("Doenças:")
        pprint(info['diseases'], indent=4)
        
        print("Medicamentos:")
        pprint(info['medications'], indent=4)
        
        print("Cirurgias:")
        pprint(info['surgeries'], indent=4)
        
        print("Contatos de Emergência:")
        pprint(info['contacts'], indent=4)
        
        print("\n" + "="*50 + "\n")

