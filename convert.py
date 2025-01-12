import csv
import json

# Function to convert TSV to JSON
def tsv_to_json(tsv_file, json_file):
    with open(tsv_file, 'r') as tsv_f:
        reader = csv.DictReader(tsv_f, delimiter='\t')
        data = list(reader)

    with open(json_file, 'w') as json_f:
        json.dump(data, json_f, indent=2)

# Specify file names
tsv_file = 'public/scenarios.tsv'
json_file = 'public/scenarios.json'

# Convert TSV to JSON
tsv_to_json(tsv_file, json_file)
print(f'TSV data has been converted to JSON and saved to {json_file}')
