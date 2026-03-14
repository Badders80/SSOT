import json
import os
from pathlib import Path

from google.cloud import firestore


PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "evolution-engine")
PAYLOAD_PATH = Path(__file__).resolve().parents[1] / "data" / "firestore" / "stage-one" / "horses.prudentia-first-gear.json"


def load_payload() -> dict:
    with PAYLOAD_PATH.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict):
        raise ValueError("Expected a JSON object at the stage-one horse payload path.")
    return payload


def write_stage_one_horses() -> None:
    payload = load_payload()
    collection = str(payload.get("collection") or "horses")
    documents = payload.get("documents") or []
    if not isinstance(documents, list) or not documents:
        raise ValueError("No stage-one horse documents were found in the payload.")

    db = firestore.Client(project=PROJECT_ID)

    print(f"Writing {len(documents)} horse identity docs to Firestore project: {PROJECT_ID}")

    for row in documents:
        if not isinstance(row, dict):
            continue
        doc_id = str(row.get("doc_id") or "").strip()
        data = row.get("data")
        if not doc_id or not isinstance(data, dict):
            raise ValueError("Each stage-one horse document must include doc_id and data.")
        db.collection(collection).document(doc_id).set(data)
        print(f"OK {collection}/{doc_id}")


if __name__ == "__main__":
    try:
        write_stage_one_horses()
    except Exception as exc:
        print(f"Stage-one Firestore write failed: {exc}")
        print(
            "Check that the Firestore database exists in the target project and that ADC is authenticated "
            "before rerunning this script."
        )
