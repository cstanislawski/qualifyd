# Qualifyd RBAC Design

This document outlines the Role-Based Access Control (RBAC) design for Qualifyd, detailing the permissions associated with each predefined role.

## Core Concepts

- **Roles**: Define sets of permissions.
- **Permissions**: Specific actions a user can perform on a resource.
- **Resources**: Entities within the system that require access control (e.g., Organizations, Users, Templates, Assessments).

## Predefined Roles

Qualifyd provides the following predefined roles with specialized permissions:

1. **Admin**
2. **Template Editor**
3. **Recruiter**
4. **Reviewer**
5. **Candidate**

## Permissions Matrix

| Resource             | Action                      | Admin | Template Editor | Recruiter | Reviewer | Candidate |
| -------------------- | --------------------------- | :---: | :-------------: | :-------: | :------: | :-------: |
| **Organization**     | Read Profile                |   ✓   |        ✓        |     ✓     |     ✓    |     -     |
|                      | Update Profile              |   ✓   |        -        |     -     |     -    |     -     |
|                      | Manage Billing & Quotas     |   ✓   |        -        |     -     |     -    |     -     |
|                      | View Usage/Analytics        |   ✓   |        -        |     -     |     -    |     -     |
| **Users**            | List Users (non-candidate)  |   ✓   |        -        |     -     |     -    |     -     |
|                      | Invite/Create User          |   ✓   |        -        |     -     |     -    |     -     |
|                      | Read User Profile           |   ✓   |        ✓        |     ✓     |     ✓    |     ✓     |
|                      | Update User Profile (Self)  |   ✓   |        ✓        |     ✓     |     ✓    |     ✓     |
|                      | Update User Profile (Others)|   ✓   |        -        |     -     |     -    |     -     |
|                      | Delete User                 |   ✓   |        -        |     -     |     -    |     -     |
| **Roles**            | List Roles                  |   ✓   |        -        |     -     |     -    |     -     |
|                      | Assign Role                 |   ✓   |        -        |     -     |     -    |     -     |
|                      | Manage Custom Roles (Future)|   ✓   |        -        |     -     |     -    |     -     |
| **Environment Tpls** | Create/Upload             |   ✓   |        ✓        |     -     |     -    |     -     |
|                      | Read                        |   ✓   |        ✓        |     ✓     |     ✓    |     -     |
|                      | Update                      |   ✓   |        ✓        |     -     |     -    |     -     |
|                      | Delete                      |   ✓   |        ✓        |     -     |     -    |     -     |
| **Task Templates**   | Create                      |   ✓   |        ✓        |     -     |     -    |     -     |
|                      | Read                        |   ✓   |        ✓        |     ✓     |     ✓    |     -     |
|                      | Update                      |   ✓   |        ✓        |     -     |     -    |     -     |
|                      | Delete                      |   ✓   |        ✓        |     -     |     -    |     -     |
| **Assessment Tpls**  | Create                      |   ✓   |        ✓        |     ✓¹    |     -    |     -     |
|                      | Read                        |   ✓   |        ✓        |     ✓     |     ✓    |     -     |
|                      | Update                      |   ✓   |        ✓        |     ✓¹    |     -    |     -     |
|                      | Delete                      |   ✓   |        ✓        |     ✓¹    |     -    |     -     |
| **Assessments**      | Create/Schedule             |   ✓   |        -        |     ✓     |     -    |     -     |
|                      | Read (All)                  |   ✓   |        -        |     ✓     |     -    |     -     |
|                      | Read (Assigned)             |   ✓   |        ✓        |     ✓     |     ✓    |     ✓     |
|                      | Update (Config/Schedule)    |   ✓   |        -        |     ✓     |     -    |     -     |
|                      | Cancel                      |   ✓   |        -        |     ✓     |     -    |     -     |
|                      | Take Assessment             |   -   |        -        |     -     |     -    |     ✓     |
| **Candidates**       | Manage Pool                 |   ✓   |        -        |     ✓     |     -    |     -     |
|                      | Read Profile                |   ✓   |        -        |     ✓     |     ✓    |     ✓     |
|                      | View History/Performance    |   ✓   |        -        |     ✓     |     ✓    |     ✓     |
| **Reviews/Results**  | Read (All)                  |   ✓   |        -        |     ✓     |     ✓    |     ✓²    |
|                      | Read (Assigned)             |   ✓   |        -        |     ✓     |     ✓    |     ✓²    |
|                      | Perform Review/Score        |   ✓   |        -        |     -     |     ✓    |     -     |
|                      | Publish Feedback            |   ✓   |        -        |     -     |     ✓    |     -     |
| **Environment**      | Access (during assessment)  |   -   |        -        |     -     |     -    |     ✓     |
|                      | Access (during review)      |   ✓   |        -        |     -     |     ✓    |     -     |
|                      | Access (admin/debug)        |   ✓   |        -        |     -     |     -    |     -     |
|                      | Manage Snapshots            |   ✓   |        ✓        |     -     |     ✓    |     -     |

**Notes:**

- `✓` = Permission granted
- `-` = Permission denied
- ¹ Recruiters might have limited capabilities to assemble assessment templates from existing task/env templates, subject to final design.
- ² Candidates can only view their own results and feedback, potentially after the review is complete, based on assessment settings.

## Role Descriptions and Responsibilities

### 1. Admin

- **Description**: Full control over the organization, including users, roles, billing, quotas, and all assessment content.
- **Responsibilities**: Overall platform management, user administration, security configuration, billing oversight, troubleshooting.

### 2. Template Editor

- **Description**: Manages the building blocks of assessments: Environment Templates, Task Templates, and potentially Assessment Templates.
- **Responsibilities**: Creating, updating, and maintaining reusable templates for assessments. Ensures templates are valid and functional.

### 3. Recruiter

- **Description**: Manages the candidate pool and the assessment lifecycle for candidates.
- **Responsibilities**: Inviting candidates, creating assessments from templates, scheduling assessments, monitoring assessment progress, viewing results.

### 4. Reviewer

- **Description**: Evaluates candidate performance in completed assessments.
- **Responsibilities**: Accessing assessment recordings/snapshots, reviewing candidate work, using scoring rubrics, providing feedback.

### 5. Candidate

- **Description**: Takes assigned technical assessments.
- **Responsibilities**: Accessing their assigned assessments during the scheduled time, using the provided environment and tools to complete tasks, viewing their results/feedback (as configured).

## Future Considerations

- **Custom Roles**: Allow Admins to create custom roles with specific permission subsets.
- **Fine-grained Permissions**: Introduce more granular permissions (e.g., permission to view specific fields, permission to execute specific actions within a resource).
- **Resource Tagging/Grouping**: Base permissions on resource tags or groups (e.g., access only to templates tagged 'Kubernetes').
