# Qualifyd

Qualifyd is a platform for creating and managing realistic technical assessment environments that evaluate job candidates in work-like scenarios. Instead of traditional coding challenges, Qualifyd enables you to observe how candidates perform in realistic environments that simulate actual job responsibilities.

## Use Cases

Place candidates in practical testing scenarios such as:

- Troubleshooting Kubernetes configuration issues
- Diagnosing and resolving Linux server problems
- Creating docker-compose configurations for new services
- Writing Terraform configurations for cloud infrastructure
- And many more job-specific technical challenges

## MVP Features

- Site like [Killercoda](https://killercoda.com/)
- Technical recruiter:
  - can define a "evaluation path", which is composed of multiple testing scenarios
  - can choose from a set of pre-defined templates (K8s/Linux)
  - can create a single step / multi-step testing scenario(s) for K8s/Docker/Linux - a "template" for the testing scenario
  - can copy an existing template to create a new one
  - can create a new template from scratch
  - can interact with the machine - install software, break stuff, etc, i.e.: prepare the testing environment
  - set up readiness scripts, automatic scoring checks
  - we snapshot the machine & spin up new machines from it shortly before the test, verifying its state by the readiness scripts
  - can define/decide:
    - the test duration
    - the test start time
    - the test end time
    - the test score threshold
    - the test scenario weight
    - if there are bonus points for completing the test before the time ends, and how much per second
    - if the machine should be given access to the internet
    - if the candidate should be given access to the environment beforehand to familiarize themselves with it
    - whether to show the correct answer to the candidate after the test
    - whether to snapshot the machine after the test for manual review
- The testing scenario gets created shortly before the test
- Candidate:
  - can login via SSO / register beforehand
  - is given temporary access to a machine & instructions, with a timer
  - is presented a terminal where they can run commands
  - can see the score & results after the test (configurable by the recruiter)
- The reviewers see everything created by the user in the testing scenario, as well as bash history, automatic test results & score
- Companies:
  - can create a company profile
  - can invite members to the company & define their role - admin, editor, viewer (basic roles for now)

## Future Roadmap

- Expand Domain Coverage
  - Programming languages (Python, Go, etc.) - to cover a broader market
  - CI/CD workflows (GitLab CI, GitHub Actions)
  - Infrastructure as Code scenarios (Terraform, more?)
  - Cloud provider environments (AWS, GCP, Azure)
  - Security-focused assessments (broad range)

- Platform Enhancements
  - Evaluation path and template versioning
  - Template marketplace for cross-organization sharing
  - Tagging system for improved organization
  - Advanced role-based access control
  - Custom machine image support for diverse environments

## Why Qualifyd?

Traditional technical assessment platforms:

- [DevSkiller](https://devskiller.com/)
- [Qualified](https://www.qualified.io/)
- [Coderbyte](https://coderbyte.com/)

often have limitations, such as:

- High Costs - Expensive evaluation environments
- Lack of Transparency - "Contact sales" barriers before platform access
- Artificial Challenges - Reliance on memorizable coding puzzles rather than work-like scenarios
- Inflexibility - Inability to adapt to diverse assessment requirements
- Poor UX - Unfamiliar interfaces and workflows that distract from assessment
- Inadequate/Limited Feedback - Limited insights for candidates on performance
- Lack of Access to Industry-Standard Tools and CLIs
- Lack of custom scenario support for company-specific tech stacks and workflows

Qualifyd addresses these limitations by providing realistic, configurable environments that accurately simulate job responsibilities for infrastructure, platform engineering, and DevOps roles - aiming at improving the evaluation accuracy, being transparent about typical technical challenges encountered in the job, and providing a better experience for candidates and reviewers.

## Project Status

This project is in early development, and the name "Qualifyd" is provisional. Alternative names under consideration:

- Veryfye
- TrueEnv
- Worklike
- RealCheck
