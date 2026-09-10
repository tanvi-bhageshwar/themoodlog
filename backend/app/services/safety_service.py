import re
from typing import Tuple, Optional


class SafetyService:
    """
    Dedicated crisis and distress detection service.
    
    Disclaimer: Keyword and pattern heuristic detection is a supportive boundary
    mechanism, NOT a certified clinical diagnostic system. MoodLog is strictly
    a personal journaling tool and never a substitute for medical or crisis services.
    """

    # Compiled patterns for self-harm, suicidal ideation, or immediate crisis indicators
    DISTRESS_PATTERNS = [
        r"\b(kill|killing)\s+(my\s*self|myself)\b",
        r"\b(end|ending)\s+(my\s*life|it\s*all)\b",
        r"\b(want|wanna|wish)\s+to\s+die\b",
        r"\b(better\s+off\s+dead)\b",
        r"\b(suicid(e|al))\b",
        r"\b(commit\s+suicide)\b",
        r"\b(hang|hanging)\s+myself\b",
        r"\b(overdose|od)\s+(on|pills)\b",
        r"\b(cut|cutting|harm)\s+(my\s*self|myself|my\s*wrists)\b",
        r"\b(don'?t\s+want\s+to\s+wake\s+up)\b",
        r"\b(nobody\s+would\s+care\s+if\s+i\s+die)\b",
        r"\b(can'?t\s+go\s+on\s+living)\b",
    ]

    COMPILED_PATTERNS = [re.compile(pattern, re.IGNORECASE) for pattern in DISTRESS_PATTERNS]

    SAFETY_RESPONSE = (
        "We noticed your reflection touches on painful feelings of crisis or self-harm. "
        "Please know that you matter, you are not alone, and there is compassionate support available right now.\n\n"
        "MoodLog is a private self-reflection app and cannot provide clinical or emergency care. "
        "If you are feeling overwhelmed or in danger, please reach out immediately:\n"
        "• United States & Canada: Call or text 988 (Suicide & Crisis Lifeline — free, 24/7, confidential)\n"
        "• Crisis Text Line: Text HOME to 741741\n"
        "• United Kingdom: Call 111 or text SHOUT to 85258\n"
        "• International: Visit https://findahelpline.com to find immediate local assistance.\n\n"
        "Please connect with a professional or trusted loved one today."
    )

    @classmethod
    def check_distress(cls, content: str) -> Tuple[bool, Optional[str]]:
        """
        Analyze journal content for critical safety indicators.
        Returns a tuple of (is_distress, safety_response).
        """
        if not content:
            return False, None

        normalized_text = content.strip().lower()
        for pattern in cls.COMPILED_PATTERNS:
            if pattern.search(normalized_text):
                return True, cls.SAFETY_RESPONSE

        return False, None


safety_service = SafetyService()
