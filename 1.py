import boto3
from urllib.parse import urlparse

# Wasabi credentials
ACCESS_KEY = "VZXPY83KLHVXBVZGYA1X"
SECRET_KEY = "981JanAJ7mfU0SLMTPWULzoa7Rs1ll8UP9fXMFSi"
REGION = "ap-northeast-2"          # example
ENDPOINT = "https://s3.ap-northeast-2.wasabisys.com"

# File URL from Wasabi
FILE_URL = "https://s3.ap-northeast-2.wasabisys.com/project-carrear-portal/resumes/dc344cd9-b511-44a9-9351-23f3c5a316be_f4765598-ead2-4eda-bb74-8eb5bca5ae44_1767852966264.pdf"

# Local save path
LOCAL_FILE = "file.pdf"

# Parse URL
parsed = urlparse(FILE_URL)
bucket_name = parsed.path.split("/")[1]
object_key = "/".join(parsed.path.split("/")[2:])

# S3 client
s3 = boto3.client(
    "s3",
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    endpoint_url=ENDPOINT,
    region_name=REGION
)

# Download file
s3.download_file(bucket_name, object_key, LOCAL_FILE)

print("File downloaded successfully")

