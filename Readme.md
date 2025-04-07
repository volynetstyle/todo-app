# Ionic Angular Todo App

A feature-rich Todo application built with Ionic Angular that includes:

- Tab navigation with smooth animations
- Task creation, editing, and deletion
- Local storage persistence
- Completed tasks tracking
- Due date management
- Beautiful UI with animations

## Features

### Task Management
- Create new tasks with title, description, and due date
- Mark tasks as complete/incomplete
- Edit existing tasks
- Delete tasks
- View tasks in two tabs: Active and Completed

### UI Features
- Tab animations for smooth transitions
- Floating action button (FAB) for adding new tasks
- Item slide animations
- Form animations
- Interactive checkbox animations
- Responsive design for all screen sizes
- Dark mode support

### Technical Features
- Local storage persistence
- Reactive state management with RxJS
- Form validation
- Modular architecture
- Lazy loading for improved performance

## Project Structure

```
todo-app/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   ├── task.model.ts
│   │   │   └── task.service.ts
│   │   ├── tabs/
│   │   │   ├── tabs-routing.module.ts
│   │   │   ├── tabs.module.ts
│   │   │   ├── tabs.page.html
│   │   │   ├── tabs.page.scss
│   │   │   └── tabs.page.ts
│   │   ├── task-list/
│   │   │   ├── task-list-routing.module.ts
│   │   │   ├── task-list.component.html
│   │   │   ├── task-list.component.scss
│   │   │   ├── task-list.component.spec.ts
│   │   │   ├── task-list.component.ts
│   │   │   └── task-list.module.ts
│   │   ├── task-edit/
│   │   │   ├── task-edit-routing.module.ts
│   │   │   ├── task-edit.component.html
│   │   │   ├── task-edit.component.scss
│   │   │   ├── task-edit.component.spec.ts
│   │   │   ├── task-edit.component.ts
│   │   │   └── task-edit.module.ts
│   │   ├── completed/
│   │   │   ├── completed-routing.module.ts
│   │   │   ├── completed.module.ts
│   │   │   ├── completed.page.html
│   │   │   ├── completed.page.scss
│   │   │   └── completed.page.ts
│   │   ├── app-routing.module.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.component.spec.ts
│   │   ├── app.component.ts
│   │   └── app.module.ts
│   ├── theme/
│   │   └── variables.scss
│   └── global.scss
└── package.json
```

## Installation & Setup

1. Make sure you have Node.js and npm installed
2. Install Ionic CLI: `npm install -g @ionic/cli`
3. Clone this repository or create the files as shown
4. Navigate to the project directory: `cd todo-app`
5. Install dependencies: `npm install`
6. Add UUID package: `npm install uuid`
7. Run the app: `ionic serve`

## Dependencies

- @ionic/angular
- @angular/forms (for form handling)
- uuid (for generating unique IDs)
- RxJS (for reactive state management)

## Future Enhancements

- Cloud synchronization
- Task categories/labels
- Task priorities
- Notifications for due dates
- Task search and filtering
- Task sharing
- Statistics and reports