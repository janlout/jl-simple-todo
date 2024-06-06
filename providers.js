const vscode = require('vscode');
const path = require('path');

/**
 * The provider for the todo list, which is a TreeView
 */
class TodoListProvider {

    constructor(){
        if (TodoListProvider.instance) {
            return TodoListProvider.instance;
        }

        TodoListProvider.instance = this;

        this._onDidChangeTreeData = new vscode.EventEmitter();

        this.todoItems = [];

        return this;
    }

    get onDidChangeTreeData() {
        return this._onDidChangeTreeData.event;
    }

    /**
     * Refresh the tree view of the todo list
     */
    refresh() {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Get a single item in the tree view
     * @param {TodoItem} element The element to get
     * @returns {TodoItem}
     */
    getTreeItem(element) {
        return element;
    }

    /**
     * Helper function to get the children of an element in the TodoListProvider
     * If no element is passed in, it returns the root elements
     * @param {TodoItem} element The element to get the children of
     * @returns {Promise<TodoItem[]>}
     */
    getChildren(element) {
        if(element) {
            return Promise.resolve(element.getChildren());
        } else {
            return Promise.resolve(this.todoItems);
        }
    }   

    /**
     * Creates a new todo item and adds it to the top level of the TodoListProvider
     * @param {String} todoItemString Label for the new todo item
     */
    addTodoItem(todoItemString) {
        this.todoItems.push(new TodoItem(todoItemString, null));
        //console.log(this.todoItems);
        this._onDidChangeTreeData.fire();
    }

    /**
     * Removes a top-level todo item from the TodoListProvider, should only be called by TodoItem.removeSelf()
     * @param {TodoItem} todoItem The todo item to remove
     */
    removeTodoItem(todoItem) {
        this.todoItems = this.todoItems.filter(item => item !== todoItem);
        this._onDidChangeTreeData.fire();
    }

    /**
     * Clears all todo items from the TodoListProvider
     */
    clearAll(){
        this.todoItems = [];
        this._onDidChangeTreeData.fire();
    }

    /**
     * Marks all todo items as done
     */
    doneAll(){
        this.todoItems.forEach(item => {
            item.recursiveDone();
        });
    }

}

/**
 * TodoItem class to represent a single todo item in the tree view of TodoListProvider
 * @extends vscode.TreeItem
 */
class TodoItem extends vscode.TreeItem {
    constructor(
         label,
         parent
    ){
        super(label, 0);
        this.label = label;
        this.parent = parent;
        this.children = [];
        this.contextValue = 'todoItem';
        this.iconPath = {
            light: path.join(__dirname, 'resources', 'light', 'open.svg'), // path for light theme icon
            dark: path.join(__dirname, 'resources', 'dark', 'open.svg') // path for dark theme icon
        };
    }

    /**
     * @returns {boolean} True if the todo item has children, false otherwise
     */
    hasChildren() {
        return this.children.length > 0;
    }

    /**
     * @returns {Promise<TodoItem[]>} The children of the todo item
     */
    getChildren() {
        return Promise.resolve(this.children);
    }

    /**
     * Adds the specified TodoItem as a child of this TodoItem
     * @param {TodoItem} childItemString 
     */
    addChildItem(childItemString) {
        this.children.push(new TodoItem(childItemString, this));
        this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        TodoListProvider.instance.refresh();
    }

    /**
     * Removes itself from the children list of its parent TodoItem
     * If it has no parent, it removes itself from the TodoListProvider
     */
    removeSelf() {
        if(this.parent) {
            this.parent.children = this.parent.children.filter(item => item !== this);
            if(this.parent.children.length === 0) {
                this.parent.collapsibleState = vscode.TreeItemCollapsibleState.None;
            }
            TodoListProvider.instance.refresh();
        } else{
            TodoListProvider.instance.removeTodoItem(this);
        }
    }

    /**
     * Edits the label of the todo item
     * @param {String} newLabel 
     */
    editItem(newLabel) {
        this.label = newLabel;
        TodoListProvider.instance.refresh();
    }

    /**
     * Marks the todo item as done
     */
    doneItem() {
        this.iconPath = {
            light: path.join(__dirname, 'resources', 'light', 'complete.svg'), // path for light theme icon
            dark: path.join(__dirname, 'resources', 'dark', 'complete.svg') // path for dark theme icon
        };
        this.contextValue = 'doneItem';
        TodoListProvider.instance.refresh();
        this.children.forEach(child => {
            child.doneItem();
        });
    }

    /**
     * Recursively marks the todo item and all of its children as done
     */
    recursiveDone(){
        this.doneItem();
        this.children.forEach(child => {
            child.recursiveDone();
        });
    }

    reopenItem() {
        this.iconPath = {
            light: path.join(__dirname, 'resources', 'light', 'open.svg'), // path for light theme icon
            dark: path.join(__dirname, 'resources', 'dark', 'open.svg') // path for dark theme icon
        };
        this.contextValue = 'todoItem';
        TodoListProvider.instance.refresh();
        if(this.parent) {
            this.parent.reopenItem();
        }
    }
}

module.exports = {TodoListProvider, TodoItem};