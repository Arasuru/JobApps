import pandas as pd
import spacy
from spacy.tokens import DocBin
from spacy.util import filter_spans
import re
from sklearn.model_selection import train_test_split

# 1. Load the cleaned dataset
df = pd.read_csv("./data/MASTER_CLEANED_JOBS.csv") 

# 2. Split the data (80% for training, 20% for testing)
# random_state=42 ensures the shuffle is exactly the same every time you run it
train_df, dev_df = train_test_split(df, test_size=0.2, random_state=42)

print(f"Total jobs: {len(df)}")
print(f"Training on: {len(train_df)} jobs")
print(f"Testing on: {len(dev_df)} jobs\n")

# 3. Create a reusable function to build the .spacy files
def create_spacy_dataset(dataframe, output_filename):
    nlp = spacy.blank("en")
    db = DocBin()
    successful = 0
    
    for idx, row in dataframe.iterrows():
        text = str(row['raw_scraped_text'])
        if not text or text == 'nan':
            continue
            
        doc = nlp.make_doc(text)
        ents = []
        
        entities_to_find = {
            "JOB_TITLE": str(row['job_title']),
            "COMPANY": str(row['company_name']),
            "LOCATION": str(row['location']),
            "SALARY": str(row['salary_range']),
            "EXPERIENCE": str(row['experience_required']),
            "EMPLOYMENT_TYPE": str(row['employment_type']),
        }

        if 'technical_skills' in row and pd.notna(row['technical_skills']):
            skills = [s.strip() for s in str(row['technical_skills']).split('|')]
            for skill in skills:
                if skill:
                     entities_to_find[f"SKILL_{skill}"] = skill 
        
        if 'soft_skills' in row and pd.notna(row['soft_skills']):
            skills = [s.strip() for s in str(row['soft_skills']).split('|')]
            for skill in skills:
                if skill:
                     entities_to_find[f"SKILL_{skill}"] = skill 
                     
        for label, search_string in entities_to_find.items():
            if search_string and search_string != 'nan':
                if search_string.isalpha():
                    pattern = r'\b' + re.escape(search_string) + r'\b'
                else:
                    pattern = re.escape(search_string)
                    
                for match in re.finditer(pattern, text, re.IGNORECASE):
                    final_label = "SKILL" if label.startswith("SKILL_") else label
                    span = doc.char_span(match.start(), match.end(), label=final_label)
                    if span is not None:
                        ents.append(span)

        try:
            doc.ents = filter_spans(ents)
            db.add(doc)
            successful += 1
        except ValueError:
            pass
            
    db.to_disk(output_filename)
    print(f"✅ Saved {successful} records to {output_filename}")

# 4. Generate both files!
print("Building Training Dataset...")
create_spacy_dataset(train_df, "./train.spacy")

print("\nBuilding Development Dataset...")
create_spacy_dataset(dev_df, "./dev.spacy")