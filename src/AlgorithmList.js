// To add a new algorithm, import it here and add it to AlgorithmList

import AVL from './algo/AVL';
import ArrayList from './algo/ArrayList';
import BFS from './algo/BFS';
import BST from './algo/BST';
import BTree from './algo/BTree';
import BoyerMoore from './algo/BoyerMoore';
import BruteForce from './algo/BruteForce';
import BubbleSort from './algo/BubbleSort';
import ClosedHash from './algo/ClosedHash';
import CocktailSort from './algo/CocktailSort';
import DFS from './algo/DFS';
import DPLCS from './algo/DPLCS';
import DequeArray from './algo/DequeArray';
import DequeLL from './algo/DequeLL';
import { Dijkstra } from './algo/DijkstraPrim';
import DoublyLinkedList from './algo/DoublyLinkedList';
import Floyd from './algo/Floyd';
import Heap from './algo/Heap';
import InsertionSort from './algo/InsertionSort';
import KMP from './algo/KMP';
import Kruskal from './algo/Kruskal';
import LSDRadix from './algo/LSDRadix';
import LinkedList from './algo/LinkedList';
import MergeSort from './algo/MergeSort';
import OpenHash from './algo/OpenHash';
import { Prim } from './algo/DijkstraPrim';
import QueueArray from './algo/QueueArray';
import QueueLL from './algo/QueueLL';
import QuickSelect from './algo/QuickSelect';
import QuickSort from './algo/QuickSort';
import RabinKarp from './algo/RabinKarp';
import SelectionSort from './algo/SelectionSort';
import SinglyCircularlyLinkedList from './algo/SinglyCircularlyLinkedList';
import SkipList from './algo/SkipList';
import SplayTree from './algo/SplayTree';
import StackArray from './algo/StackArray';
import StackLL from './algo/StackLL';

// format:
// AlgorithmName: ['MenuDisplayName', ClassName, 'VerboseDisplayName' (opt)]
export const AlgorithmList = {
	ArrayList: ['ArrayList', ArrayList],
	LinkedList: ['Singly LinkedList', LinkedList],
	DoublyLinkedList: ['Doubly LinkedList', DoublyLinkedList],
	SinglyCircularlyLinkedList: ['Circularly LinkedList', SinglyCircularlyLinkedList],
	StackArray: ['Stack (Array)', StackArray],
	StackLL: ['Stack (LinkedList)', StackLL],
	QueueArray: ['Queue (Array)', QueueArray],
	QueueLL: ['Queue (LinkedList)', QueueLL],
	DequeArray: ['Deque (Array)', DequeArray],
	DequeLL: ['Deque (LinkedList)', DequeLL],
	BST: ['Binary Search Tree', BST],
	Heap: ['Heaps / PQs', Heap],
	SkipList: ['SkipList', SkipList],
	ClosedHash: ['HashMap (Probing)', ClosedHash],
	OpenHash: ['HashMap (Chaining)', OpenHash],
	SplayTree: ['SplayTree', SplayTree],
	AVL: ['AVL', AVL],
	BTree: ['2-4 Tree', BTree],
	BubbleSort: ['Bubble Sort', BubbleSort],
	CocktailSort: ['Cocktail Shaker Sort', CocktailSort],
	InsertionSort: ['Insertion Sort', InsertionSort],
	SelectionSort: ['Selection Sort', SelectionSort],
	QuickSort: ['QuickSort', QuickSort],
	QuickSelect: ['QuickSelect', QuickSelect],
	MergeSort: ['MergeSort', MergeSort],
	LSDRadix: ['LSD Radix Sort', LSDRadix],
	BruteForce: ['Brute Force', BruteForce],
	BoyerMoore: ['Boyer-Moore', BoyerMoore],
	KMP: ['KMP', KMP],
	RabinKarp: ['Rabin-Karp', RabinKarp],
	BFS: ['Breadth-First Search', BFS],
	DFS: ['Depth-First Search', DFS],
	Dijkstra: ["Dijkstra's", Dijkstra],
	Prim: ["Prim's", Prim],
	Kruskal: ["Kruskal's", Kruskal],
	DPLCS: ['LCS', DPLCS, 'Dynamic Programming (Longest Common Subsequence)'],
	Floyd: ['Floyd-Warshall', Floyd],
};

export const isAlgorithm = name => {
	return Object.keys(AlgorithmList).includes(name);
};
