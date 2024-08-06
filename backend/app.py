from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from PyPDF2 import PdfReader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from flask_cors import CORS
from langchain.chains.question_answering import load_qa_chain
from langchain.llms import OpenAI
from dotenv import load_dotenv
app = Flask(__name__)
CORS(app)
load_dotenv()
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf'}

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

openai_api_key = os.getenv("OPENAI_API_KEY")

docsearches = {}
uploaded_files = []
docsearch = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']
prefixUrl = "/api"
@app.route('/')
def index():
    return "Welcome to the Flask server!"

@app.route(f'{prefixUrl}/upload', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'}), 400

    files = request.files.getlist('files')
    print(f"upload file {files}")
    if not files:
        return jsonify({'error': 'No selected files'}), 400

    errors = []
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            print()
            print()
            print(f"fil_path, {file_path}")
            print(f'===== file_path {file_path} file name = {filename}')
            file.save(file_path)

            uploaded_files.append(filename)

    if errors:
        return jsonify({'message': 'Some files could not be processed', 'errors': errors}), 500

    return jsonify({'message': 'All files uploaded successfully!'}), 200

@app.route(f'{prefixUrl}/delete', methods=['POST'])
def delete_file():
    data = request.json
    filename = data.get('fileName')
    filename = secure_filename(filename)
    print(f"data ====== {data}")
    if not filename or filename not in uploaded_files:
        return jsonify({'error': 'File not found'}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        uploaded_files.remove(filename)

        return jsonify({'message': 'File deleted successfully!'}), 200
    else:
        return jsonify({'error': 'File not found on server'}), 400

@app.route(f'{prefixUrl}/uploaded_files', methods=['GET'])
def get_uploaded_files():
    return jsonify({'uploaded_files': uploaded_files}), 200

@app.route(f'{prefixUrl}/train', methods=['POST'])
def train_model():
    retrain_model()
    return jsonify({'message': 'Model trained successfully!'}), 200

def process_file(file_path):
    reader = PdfReader(file_path)
    raw_text = ''
    for page in reader.pages:
        text = page.extract_text()
        if text:
            raw_text += text

    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )

    texts = text_splitter.split_text(raw_text)
    embeddings = OpenAIEmbeddings()
    docsearch = FAISS.from_texts(texts, embeddings)
    return docsearch

def retrain_model():
    all_texts = []
    for filename in uploaded_files:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        reader = PdfReader(file_path)
        raw_text = ''
        for page in reader.pages:
            text = page.extract_text()
            if text:
                raw_text += text
        
        text_splitter = CharacterTextSplitter(
            separator="\n",
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )

        texts = text_splitter.split_text(raw_text)
        all_texts.extend(texts)

    embeddings = OpenAIEmbeddings()
    global docsearch
    docsearch = FAISS.from_texts(all_texts, embeddings)


@app.route(f'{prefixUrl}/ask', methods=['POST'])
def ask_question():
    data = request.json
    query = data.get('question')
    context = data.get('context', [])

    if not query:
        return jsonify({'error': 'No question provided'}), 400

    # Format the context according to the specified logic
    formatted_context = []
    for msg in context:
        if msg['isQuestion']:
            formatted_context.append(f"I asked {msg['text']}")
        else:
            formatted_context.append(f"You answered {msg['text']}")
    
    # Add the final query with the "Now please answer" format
    combined_context = "\n".join(formatted_context) + f"\nNow please answer {query}"
    query = combined_context
    print(query)

    if not (docsearch):
        return jsonify({'error': 'No documents uploaded'}), 400

    try:
        chain = load_qa_chain(OpenAI(), chain_type="stuff")
        docs = docsearch.similarity_search(combined_context)
        
        if not docs:  # Check if any documents were found
            return jsonify({'error': 'No documents found for the given query'}), 404
        
        answer = chain.run(input_documents=docs, question=query)
        return jsonify({'answer': answer}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
