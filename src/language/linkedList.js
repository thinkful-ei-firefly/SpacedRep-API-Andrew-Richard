'use strict';

class _Node {
    constructor(value, next) {
        this.value = value;
        this.next= next;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
    }
    insertFirst(item) {
        this.head=new _Node(item, this.head);
    }
    insertLast(item) {
        if (this.head === null) {
            this.insertFirst(item);
            return;
        }
        let tempNode = this.head;
        while (tempNode.next !== null) {
            tempNode = tempNode.next;
        }
        tempNode.next = new _Node(item, null);
    }
    insertBefore(item, before) {
        //Special Case if inserting before the head
        if(before === this.head.value) {
            const beforeNode = new _Node(item, this.head);
            this.head = beforeNode;
            return;
        }
        //start at the head of LL
        let currNode = this.head;

        //If the LL is empty, return null
        if(!this.head) {
            return null;
        }

        //loop through nodes in LL
        while(currNode.value !== before) {
            //check if at the end of the list, if so return null
            if(currNode.next === null) {
                return null;
            }
            else if(currNode.next.value === before) {
                //insert new item
                const beforeNode = new _Node(item, currNode.next);
                currNode.next = beforeNode;
                return;
            }
            else {
                //otherwise update to next node
                currNode = currNode.next;
            }
        }
        return null;
    }
    insertAfter(item, after) {
        const currNode = this.find(after);
        const afterNode = new _Node(item, currNode.next);
        currNode.next = afterNode;
        return;

    }
    insertAt(item, index, counter = 0, currNode = this.head) {
        // if at head
        if(index === 0) {
            const newNode = new _Node(item, this.head);
            this.head = newNode;
            return;
        }
        if(counter === index - 1) {
            currNode.next = new _Node(item, currNode.next);
            return;
        }
        else {
            this.insertAt(item, index, counter + 1, currNode.next);
        }
    }
    remove(item) {
        if (!this.head) {
            return null;
        }
        if (this.head.value === item) {
            this.head = this.head.next;
            return;
        }
        let tempNode = this.head;
        while ((tempNode.next !== null) && (tempNode.next.value !== item)) {
            tempNode = tempNode.next;
        }
        if (tempNode.next === null) {
            console.log(`${item} not found`);
            return;
        }
      
        tempNode.next = tempNode.next.next;
        return;
    }
    find(item) {
        //start at the head of LL
        let currNode = this.head;

        //If the LL is empty, return null
        if(!this.head) {
            return null;
        }

        //loop through nodes in LL
        while(currNode.value.original !== item) {
            //check if at the end of the list, if so return null
            if(currNode.next === null) {
                return null;
            }
            else {
                //otherwise update to next node
                currNode = currNode.next;
            }
        }

        return currNode;
    }
    log() {
        let tempNode=this.head;
        while (tempNode !== null) {
            console.log(tempNode.value);
            tempNode=tempNode.next;
        }
    }
}

module.exports = LinkedList;