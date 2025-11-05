import os
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_core.documents import Document

def load_and_chunk_docs(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    file_name = os.path.basename(file_path)
    docs = []

    if ext == ".pdf":
        loader = PyPDFLoader(file_path)
        docs = [
            Document(page_content=doc.page_content, metadata={
                "file_type": "pdf",
                "file_name": file_name,
                "source_location": f"Page {i+1}"
            }) for i, doc in enumerate(loader.load())
        ]
        # Optionally split long pdfs by length as fallback

    elif ext == ".docx":
        loader = Docx2txtLoader(file_path)
        docs = [Document(page_content=doc.page_content, metadata={
            "file_type": "docx",
            "file_name": file_name,
            "source_location": "Document"
        }) for doc in loader.load()]
        # One document for the whole file

    elif ext == ".txt":
        loader = TextLoader(file_path, encoding="utf-8")
        docs = [Document(page_content=doc.page_content, metadata={
            "file_type": "txt",
            "file_name": file_name,
            "source_location": "Text"
        }) for doc in loader.load()]

    elif ext == ".csv":
        import pandas as pd
        data = pd.read_csv(file_path)
        columns = ", ".join(data.columns)
        preview = data.head(5).to_string(index=False)
        summary = f"Table columns: {columns}\nPreview (first 5 rows):\n{preview}"
        docs = [Document(page_content=summary, metadata={
            "file_type": "csv",
            "file_name": file_name,
            "source_location": "main table"
        })]
        # One chunk per table (whole file or sheet in xlsx)

    elif ext == ".xlsx":
        import pandas as pd
        excel = pd.ExcelFile(file_path)
        for sheet_name in excel.sheet_names:
            data = excel.parse(sheet_name)
            columns = ", ".join(data.columns)
            preview = data.head(5).to_string(index=False)
            summary = f"Sheet: {sheet_name}\nTable columns: {columns}\nPreview (first 5 rows):\n{preview}"
            docs.append(Document(page_content=summary, metadata={
                "file_type": "xlsx",
                "file_name": file_name,
                "source_location": sheet_name
            }))
        # One chunk per sheet

    elif ext in (".ifc", ".bim"):
        try:
            import ifcopenshell
            model = ifcopenshell.open(file_path)
            element_types = [
                "IfcWall", "IfcSlab", "IfcColumn", "IfcBeam",
                "IfcDoor", "IfcWindow", "IfcStair",
                "IfcBuilding", "IfcBuildingStorey", "IfcSpace", "IfcProject"
            ]
            for etype in element_types:
                try:
                    entities = model.by_type(etype)
                    if entities:
                        summaries = []
                        for ent in entities[:10]:  # up to 10
                            info = ent.get_info()
                            summaries.append(f"{etype}: Name={info.get('Name')}, id={info.get('GlobalId')}")
                        if len(entities) > 10:
                            summaries.append(f"...({len(entities)-10} more entities not shown)")
                        summary = "\n".join(summaries)
                        docs.append(Document(page_content=summary, metadata={
                            "file_type": "ifc",
                            "file_name": file_name,
                            "source_location": etype
                        }))
                except Exception:
                    pass
            if not docs:
                docs.append(Document(page_content="No major elements found.", metadata={
                    "file_type": "ifc",
                    "file_name": file_name,
                    "source_location": "unknown"
                }))
        except ImportError:
            raise Exception("Install ifcopenshell for IFC/BIM support")
        # One chunk per entity type

    elif ext in (".dwg", ".dxf"):
        try:
            import ezdxf
            doc = ezdxf.readfile(file_path)
            layer_entity_count = {}
            for entity in doc.entities:
                layer = entity.dxf.get("layer", "UNKNOWN")
                layer_entity_count[layer] = layer_entity_count.get(layer, 0) + 1
            for layer, count in layer_entity_count.items():
                summary = f"Layer: {layer} — {count} entities"
                docs.append(Document(page_content=summary, metadata={
                    "file_type": ext[1:],
                    "file_name": file_name,
                    "source_location": layer
                }))
        except ImportError:
            raise Exception("Install ezdxf for DWG/DXF support")
        # One chunk per layer

    elif ext in [".jpg", ".jpeg", ".png"]:
        try:
            from PIL import Image
            import pytesseract
            text = pytesseract.image_to_string(Image.open(file_path))
            summary = f"[IMAGE TEXT]\n{text}"
            docs = [Document(page_content=summary, metadata={
                "file_type": ext[1:],
                "file_name": file_name,
                "source_location": "image"
            })]
        except ImportError:
            raise Exception("Install pytesseract and pillow for OCR support")
        # One chunk per image file

    else:
        raise ValueError(f"Unsupported file type: {ext}")

    return docs  # structure-based, not length-based chunks!
