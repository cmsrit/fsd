# AWS S3 Setup Guide for Document Vault

## Overview

This guide will help you configure IAM permissions and S3 bucket policies for your Document Vault application.

---

## 1. IAM User Permissions

### Option A: Using IAM Policy (Recommended)

1. **Go to AWS Console** → IAM → Users
2. **Select your IAM user** (or create a new one)
3. **Click "Add permissions"** → "Attach policies directly"
4. **Create a custom policy** with the following JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": ["arn:aws:s3:::awsccritdemo", "arn:aws:s3:::awsccritdemo/*"]
    }
  ]
}
```

**Name this policy**: `DocVaultS3Access`

### Option B: Using AWS Managed Policy (Simpler but broader access)

Attach the AWS managed policy: `AmazonS3FullAccess`
_(Not recommended for production - gives access to ALL S3 buckets)_

---

## 2. S3 Bucket Configuration

### Step 1: Unblock Public Access (if needed for public files)

1. Go to **S3 Console** → Select bucket `awsccritdemo`
2. Go to **Permissions** tab
3. **Block Public Access** settings:
   - If you want files to be publicly accessible, **uncheck** "Block all public access"
   - If files should be private (accessed only through your app), **keep it checked**

### Step 2: Configure Bucket Policy

Go to **Permissions** → **Bucket Policy** and add:

#### For PUBLIC access (anyone can upload and download):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadWriteAccess",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::awsccritdemo/*"
    },
    {
      "Sid": "PublicListBucket",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::awsccritdemo"
    }
  ]
}
```

⚠️ **WARNING**: This allows anyone on the internet to upload, download, and delete files!

#### For PRIVATE access (recommended - files only accessible through your app):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowIAMUserAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_IAM_USERNAME"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": ["arn:aws:s3:::awsccritdemo", "arn:aws:s3:::awsccritdemo/*"]
    }
  ]
}
```

**Replace:**

- `YOUR_ACCOUNT_ID` with your AWS Account ID (12-digit number)
- `YOUR_IAM_USERNAME` with your IAM user name

**To find your Account ID:**

- Click on your username in top-right corner of AWS Console
- Copy the 12-digit Account ID

---

## 3. CORS Configuration (Important!)

Your browser needs permission to upload files directly. Add CORS configuration:

1. Go to **S3 Console** → Select bucket `awsccritdemo`
2. Go to **Permissions** tab
3. Scroll to **Cross-origin resource sharing (CORS)**
4. Click **Edit** and add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**For production**, replace `"*"` in AllowedOrigins with your domain:

```json
"AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"]
```

---

## 4. Environment Variables Setup

Make sure your `.env` file contains:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

**To get your Access Keys:**

1. Go to **IAM** → **Users** → Select your user
2. **Security credentials** tab
3. **Create access key** → Select "Application running on AWS compute service" or "Local code"
4. Copy both the Access Key ID and Secret Access Key

⚠️ **IMPORTANT**: Never commit `.env` file to git!

---

## 5. Verification Checklist

- [ ] IAM user has proper S3 permissions
- [ ] S3 bucket exists and is in the correct region
- [ ] Bucket policy is configured (public or private)
- [ ] CORS configuration is added
- [ ] `.env` file has correct AWS credentials
- [ ] Block Public Access settings match your bucket policy
- [ ] Server is restarted after changes

---

## 6. Testing

After setup, test your configuration:

1. Restart your Node.js server:

   ```bash
   node server.js
   ```

2. Open browser: `http://localhost:3000`

3. Try uploading a file

4. Check server console for errors

---

## Common Issues & Solutions

### Issue: "Access Denied" error

**Solution**: Check IAM permissions and bucket policy

### Issue: "CORS error" in browser

**Solution**: Add CORS configuration to S3 bucket

### Issue: Files upload but can't be accessed

**Solution**: Check Block Public Access settings and bucket policy

### Issue: "No such bucket" error

**Solution**: Verify bucket name and AWS region match

---

## Security Best Practices

1. **Never use root account credentials** - Always use IAM users
2. **Use least privilege** - Only grant necessary permissions
3. **Rotate access keys** regularly
4. **Enable MFA** on your AWS account
5. **Use environment variables** for credentials (never hardcode)
6. **For production**: Use IAM roles instead of access keys (when on EC2/Lambda)
7. **Enable S3 versioning** to prevent accidental deletions
8. **Enable CloudTrail** logging for audit trails

---

## Need Help?

If you still have issues:

1. Check AWS CloudTrail logs for detailed error messages
2. Look at S3 access logs
3. Verify AWS credentials with: `aws s3 ls s3://awsccritdemo` (requires AWS CLI)
