from typing import List, Dict
import numpy as np
from app.core.logging import get_logger

logger = get_logger(__name__)

KNOWN_VENDORS = {
    "google ads": "Marketing Expense",
    "meta ads": "Marketing Expense",
    "facebook ads": "Marketing Expense",
    "aws": "Software & Subscriptions",
    "amazon web services": "Software & Subscriptions",
    "slack": "Software & Subscriptions",
    "notion": "Software & Subscriptions",
    "zoom": "Software & Subscriptions",
    "github": "Software & Subscriptions",
    "swiggy": "Meals & Entertainment",
    "zomato": "Meals & Entertainment",
    "uber": "Travel & Transport",
    "ola": "Travel & Transport",
}


def rule_based_category(vendor: str, txn_type: str) -> Dict | None:
    key = vendor.lower().strip()
    for pattern, category in KNOWN_VENDORS.items():
        if pattern in key:
            return {"category": category, "confidence": 99, "prediction_source": "rule_engine"}
    if txn_type == "income":
        if any(w in key for w in ["payment", "client", "invoice", "receipt"]):
            return {"category": "Revenue", "confidence": 90, "prediction_source": "rule_engine"}
    return None


def detect_anomalies(transactions: List[Dict]) -> List[Dict]:
    """Apply Z-score anomaly detection on amounts."""
    if len(transactions) < 3:
        return transactions
    amounts = np.array([t["amount"] for t in transactions], dtype=float)
    mean, std = amounts.mean(), amounts.std()
    if std == 0:
        return transactions
    for t in transactions:
        z = abs((t["amount"] - mean) / std)
        if z > 2.5:
            t["anomaly_flag"] = True
            t["anomaly_reason"] = f"Unusual amount (z-score: {z:.1f})"
    return transactions


def detect_duplicates(transactions: List[Dict]) -> List[Dict]:
    seen = {}
    for t in transactions:
        key = (t["date"], t["vendor"], t["amount"])
        if key in seen:
            t["is_duplicate"] = True
        else:
            seen[key] = True
    return transactions
