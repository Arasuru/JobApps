import pandas as pd
import spacy
from spacy.tokens import DocBin
import re

df = pd.read_csv("data/job_dataset_20260414_121206.csv")

nlp = spacy.load("en_core_web_sm")
db = DocBin()

print(f"Processing {len(df)} rows...")

missed_entities = 0
success_count = 0

for idx, row in df.iterrows():
    text = str(row["raw_scraped_text"])

    if not text or text == "nan":
        continue

    doc = nlp.make_doc(text)

    ents = []

    entities_to_find ={
        "JOB_TITLE": str(row['job_title']),
        "COMPANY": str(row['company_name']),
        "LOCATION": str(row['location']),
        "SALARY": str(row['salary_range']),
        "experience_level": str(row['experience_required']),
        "employment_type": str(row['employment_type']),
    }
    
    # 3. Handle the pipe-separated skills
    if pd.notna(row['technical_skills']):
        skills = [s.strip() for s in str(row['technical_skills']).split('|')]
        for skill in skills:
            if skill:
                 # Add each skill to our search dictionary
                 entities_to_find[f"SKILL_{skill}"] = skill 
                 
    # 4. Search the raw text for the exact strings
    for label, search_string in entities_to_find.items():
        if search_string and search_string != 'nan':
            # Use regex to find the EXACT character indices of the string in the text
            # We use re.escape to handle weird characters like $ or +
            matches = list(re.finditer(re.escape(search_string), text))
            
            if matches:
                # If found, grab the start and end position of the first match
                start = matches[0].start()
                end = matches[0].end()
                
                # If it was a skill, change the label back to just "SKILL"
                final_label = "SKILL" if label.startswith("SKILL_") else label
                
                # Create the spaCy entity span
                span = doc.char_span(start, end, label=final_label)
                if span is not None:
                    ents.append(span)
            else:
                missed_entities += 1

    # 5. Save the labeled document
    try:
        doc.ents = ents
        db.add(doc)
        success_count += 1
    except ValueError as e:
        # This happens if entities overlap (e.g., "Senior Software Engineer" and "Software Engineer" both try to claim the same text)
        print(f"Skipping row {idx} due to overlapping entities.")

# 6. Save the data to disk in spaCy's highly efficient binary format
db.to_disk("./train.spacy")
print(f"\n✅ Auto-annotation complete!")
print(f"Successfully processed {success_count} rows.")
print(f"Could not find exact matches for {missed_entities} entities (The LLM Summarization Trap).")
print("Saved training data to ./train.spacy")