import logging
import sys
from pathlib import Path


def setup_logging(log_level: str = "INFO"):
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    Path("logs").mkdir(exist_ok=True)
    
    logging.basicConfig(
        level=getattr(logging, log_level),
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("logs/app.log")
        ]
    )
    
    logger = logging.getLogger("app")
    return logger


logger = setup_logging()
