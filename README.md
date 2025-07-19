

<img width="1410" height="686" alt="Screenshot 2025-07-12 104954" src="https://github.com/user-attachments/assets/0cb400bc-bf82-489c-9c3b-5e5fbf446a76" />














Secure File Vault
A cloud-based secure file sharing portal built with AWS services to demonstrate advanced cloud security practices. This project implements a robust, user-friendly system for securely uploading, downloading, and managing sensitive files with fine-grained access controls, encryption, and audit logging. It aligns with 2025 hiring demands for cloud security engineers by showcasing practical, real-world security solutions, including anomaly detection and automated email notifications.
Project Overview
The Secure File Vault addresses the critical need for secure file sharing in teams handling sensitive financial or client data. It ensures unauthorized access is prevented, maintaining data confidentiality and integrity while providing a seamless user experience. The project leverages AWS services to meet four core security requirements:

Encryption: Files are encrypted at rest using Amazon S3 with AWS KMS-managed server-side encryption.
Authentication and Authorization: Amazon Cognito verifies user identity with multi-factor authentication (MFA), while IAM roles enforce least privilege access.
Visibility: AWS CloudTrail logs all file interactions, monitored by CloudWatch for anomaly detection.
Anomaly Detection and Notifications: AWS CloudWatch detects anomalies such as multiple failed login attempts or unusual S3 access at midnight, triggering AWS SNS to send email notifications.

The frontend, built with React, Vite, and AWS Amplify, provides a drag-and-drop interface with role-based access controls (admin, editor, viewer).
Key Features

Secure Storage: Files stored in S3 buckets with server-side encryption using AWS KMS.
Role-Based Access Control: IAM roles for viewers (read-only), editors (read/write), and admins (full control).
User Authentication: Cognito with MFA for secure user registration and login.
Audit Logging: CloudTrail captures all file actions (upload, download, delete) for monitoring.
Anomaly Detection: CloudWatch monitors CloudTrail logs for anomalies, such as:
More than three failed login attempts.
Unusual S3 object access between midnight and 4 AM.


Email Notifications: SNS sends email alerts when CloudWatch detects anomalies.
Data Lifecycle Management: S3 lifecycle rules for automatic file archival and deletion.
User-Friendly UI: React-based interface with drag-and-drop file uploads and pre-signed URL downloads.

Technologies Used

Frontend: React, Vite, AWS Amplify, FontAwesome
Backend Services:
Amazon S3 (secure file storage)
AWS KMS (encryption key management)
Amazon Cognito (authentication)
AWS IAM (authorization)
AWS CloudTrail (audit logging)
AWS CloudWatch (log monitoring and anomaly detection)
AWS SNS (email notifications)


Deployment: AWS Amplify for hosting the UI
Build Tool: Vite for fast development and bundling
Linting: ESLint for code quality

Prerequisites

AWS account with access to S3, Cognito, IAM, CloudTrail, KMS, CloudWatch, SNS, and Amplify
Node.js (v18 or higher) and npm
AWS CLI configured with appropriate credentials
Basic knowledge of React, Vite, and AWS services

Setup Instructions

Clone the Repository
git clone https://github.com/JeevikeshOfficial/secure-file-vault.git
cd secure-file-vault


Install Dependencies
npm install


Configure AWS Services

S3 Buckets:
Create two S3 buckets: one for public files (public/) and one for admin files (admin/).
Enable server-side encryption with AWS KMS keys.
Configure CORS policies to allow access from the Amplify-hosted UI.


Cognito:
Set up a Cognito User Pool with MFA enabled.
Create user groups for admin, editor, and viewer.
Add a test user (e.g., admin.test) to the admin group.


IAM Roles:
Create IAM roles for each user group with least privilege policies:
viewer: Read-only access to public/ bucket.
editor: Read/write access to public/ bucket.
admin: Full access to both public/ and admin/ buckets.


Attach policies to restrict access by folder, IP, or time (optional).


CloudTrail:
Enable CloudTrail to log S3 and Cognito actions to a dedicated, secure bucket.


CloudWatch:
Create a CloudWatch Log Group to receive CloudTrail logs.
Set up metric filters for anomalies:
Filter for more than three failed login attempts (e.g., SignIn events with responseElements.success = false).
Filter for S3 access events (GetObject, PutObject, etc.) between 00:00 and 04:00.


Create CloudWatch Alarms to trigger SNS notifications when thresholds are exceeded.


SNS:
Create an SNS topic and subscribe an email address for notifications.
Link CloudWatch Alarms to the SNS topic to send email alerts.


KMS:
Create a KMS key for S3 encryption and grant access to IAM roles.


Amplify:
Initialize an Amplify project in the repository root:amplify init


Add authentication, storage, and hosting:amplify add auth
amplify add storage
amplify add hosting
amplify push






Update Configuration

Update src/aws-config.js with your AWS resource details (e.g., S3 bucket names, Cognito User Pool ID, SNS topic ARN).
Ensure the src/components/FileStorage.jsx component references the correct S3 bucket paths (public/, admin/).


Run Locally
npm run dev

The app will run at http://localhost:5173 (default Vite port).

Deploy to Amplify
amplify publish

Access the deployed app via the Amplify-provided URL.


Usage

Login: Use Cognito to sign in with a registered user (e.g., admin.test for admin access).
Public Directory:
All users can view files (if permitted).
Editors and admins can upload files via drag-and-drop or file selection.
Admins and editors can delete files.


Admin Directory (admin users only):
Admins can upload, download, and delete files in a separate admin section.


Security Features:
Files are encrypted at rest.
Temporary credentials via Cognito limit access scope.
CloudTrail logs all actions, monitored by CloudWatch for anomalies.
SNS sends email notifications when CloudWatch detects anomalies (e.g., >3 failed logins, midnight S3 access).

Future Enhancements

Implement S3 lifecycle policies for automatic file archival/deletion to optimize costs and compliance.
Enhance CloudWatch anomaly detection with machine learning (e.g., AWS Lookout for Metrics).
Add file preview capabilities for common file types (e.g., PDFs, images) in the UI.
Support advanced IAM conditions (e.g., IP-based or time-based access restrictions).
Integrate SNS with additional notification channels (e.g., Slack, SMS).

Why This Project?
This project demonstrates proficiency in cloud security best practices, including encryption, least privilege, authentication, auditability, and proactive anomaly detection. The integration of CloudWatch for anomaly detection and SNS for email notifications showcases advanced security monitoring skills, making this a standout portfolio piece for cloud security roles in 2025.

Contact
For questions or collaboration, reach out via [jeevikesh.official@gmail.com] or GitHub Issues.
