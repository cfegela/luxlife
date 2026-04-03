import boto3
import os
import json
from urllib.parse import unquote_plus

s3 = boto3.client('s3')

def handler(event, context):
    """
    Copy file from raw bucket to processed bucket
    """
    print(f"Received event: {json.dumps(event)}")

    # Get bucket and key from event
    source_bucket = event['detail']['bucket']['name']
    source_key = unquote_plus(event['detail']['object']['key'])

    # Get destination bucket from environment
    dest_bucket = os.environ['PROCESSED_BUCKET']
    dest_key = source_key  # Keep the same key/path

    try:
        # Copy object from source to destination
        copy_source = {
            'Bucket': source_bucket,
            'Key': source_key
        }

        print(f"Copying s3://{source_bucket}/{source_key} to s3://{dest_bucket}/{dest_key}")

        s3.copy_object(
            CopySource=copy_source,
            Bucket=dest_bucket,
            Key=dest_key
        )

        print(f"Successfully copied file to processed bucket")

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'File copied successfully',
                'source': f's3://{source_bucket}/{source_key}',
                'destination': f's3://{dest_bucket}/{dest_key}'
            })
        }

    except Exception as e:
        print(f"Error copying file: {str(e)}")
        raise
