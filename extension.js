// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { TodoListProvider, TodoItem } = require('./providers');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "jl-simple-todo" is now active!');

	const todoListProvider = new TodoListProvider();
	vscode.window.registerTreeDataProvider('jl-simple-todo', todoListProvider);
	vscode.commands.registerCommand('jl-simple-todo.refresh', () => todoListProvider.refresh());
	vscode.commands.registerCommand('jl-simple-todo.addEntry', () =>{
		vscode.window.showInputBox({ prompt: 'Enter new todo item' }).then(value => {
			if (value === undefined || value === '') {
				console.log('No todo item entered');
			} else {
				todoListProvider.addTodoItem(value);
			}
		});
	});
	vscode.commands.registerCommand('jl-simple-todo.addChildEntry', (todoItem) => {
		vscode.window.showInputBox({ prompt: 'Enter new todo item' }).then(value => {
			if (value === undefined || value === '') {
				console.log('No todo item entered');
			} else {
				todoItem.addChildItem(value);
				todoListProvider.refresh();
			}
		});
	});
	vscode.commands.registerCommand('jl-simple-todo.removeEntry', (todoItem) => {
		todoItem.removeSelf();
	});
	vscode.commands.registerCommand('jl-simple-todo.editEntry', (todoItem) => {
		vscode.window.showInputBox({ prompt: 'Enter your changes', value: todoItem.label}).then(value => {
			if (value === undefined || value === '') {
				console.log('An empty value was entered, this is not allowed!');
			} else {
				todoItem.editItem(value);
			}
		});
	});
	vscode.commands.registerCommand('jl-simple-todo.doneEntry', (todoItem) => {
		todoItem.doneItem();
	});
	vscode.commands.registerCommand('jl-simple-todo.clearAll', () => {
		todoListProvider.clearAll();
	});
	vscode.commands.registerCommand('jl-simple-todo.doneAll', () => {
		todoListProvider.doneAll();
	});
	vscode.commands.registerCommand('jl-simple-todo.reopenEntry', (todoItem) => {
		todoItem.reopenItem();
	});
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
