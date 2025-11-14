export class Stack<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
}

export class Queue<T> {
  private items: T[] = [];
  enqueue(item: T) { this.items.push(item); }
  dequeue(): T | undefined { return this.items.shift(); }
  peek(): T | undefined { return this.items[0]; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
}

export class SinglyLinkedListNode<T> {
  constructor(public value: T, public next: SinglyLinkedListNode<T> | null = null) {}
}
export class SinglyLinkedList<T> {
  head: SinglyLinkedListNode<T> | null = null;
  append(value: T) {
    const node = new SinglyLinkedListNode(value);
    if (!this.head) { this.head = node; return; }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = node;
  }
}

export class DoublyCircularNode<T> {
  constructor(public value: T, public prev: DoublyCircularNode<T> | null = null, public next: DoublyCircularNode<T> | null = null) {}
}
export class DoublyCircularList<T> {
  head: DoublyCircularNode<T> | null = null;
  append(value: T) {
    const node = new DoublyCircularNode(value);
    if (!this.head) { node.next = node; node.prev = node; this.head = node; return; }
    const tail = this.head.prev!;
    tail.next = node;
    node.prev = tail;
    node.next = this.head;
    this.head.prev = node;
  }
}

export class Graph<T> {
  private adj = new Map<T, Set<T>>();
  addVertex(v: T) { if (!this.adj.has(v)) this.adj.set(v, new Set()); }
  addEdge(a: T, b: T) { this.addVertex(a); this.addVertex(b); this.adj.get(a)!.add(b); }
  neighbors(v: T): T[] { return Array.from(this.adj.get(v) ?? []); }
}