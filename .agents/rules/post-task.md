# Post-Task Checklist (Always Apply)

After completing any code change or task, **always** perform these steps before finishing:

1. **README Check**: Review `README.md` and update it if the changes affect documented features, setup instructions, deployment steps, API endpoints, or project status. Skip if the changes are purely internal with no user-facing or documentation impact.

2. **Commit**: Stage and commit all modified files with a clear, descriptive commit message.

3. **Push**: Push the commit(s) to `origin/main` on GitHub.

4. **Deployment Instructions**: Provide the EC2 update commands so the user can deploy immediately:
   ```bash
   cd ~/Student-Management-System
   git pull origin main
   sudo docker compose up --build -d
   ```

Do not ask the user whether to commit/push/deploy — just do it by default as part of completing the task.
