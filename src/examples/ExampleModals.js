import React from 'react';

// Include the ClassName of algorithms that should have an example modal
export default {
	AVL: (
		<ul>
			<li>To cause a left rotation, add 1, 2 and 3, in that order</li>
			<li>To cause a right rotation, add 3, 2 and 1, in that order</li>
			<li>To cause a left-right rotation, add 3, 1 and 2, in that order</li>
			<li>To cause a right-left rotation, add 1, 3 and 2, in that order</li>
		</ul>
	),
	BoyerMoore: (
		<ul>
			<li>
				The worst case is when we have a text with only one letter and a pattern with that
				same letter, but a different first letter (for example, &quot;aaaaaaaaa&quot; for
				text and &quot;baaaa&quot; for pattern), since we will only mismatch on the last
				comparison
			</li>
			<li>
				When incorporating the Galil Rule, we can use logic similar to that of KMP to
				optimize our shifts. After finding a full match, instead of shifting by 1 we shift
				by the period <i>k</i>. After that shift, we don't need to compare the first{' '}
				<i>k</i> characters in the pattern because we've already compared them and know that
				they match!
			</li>
		</ul>
	),
	BruteForce: (
		<ul>
			<li>
				The worst case is when we have a text with only one letter and a pattern with that
				same letter, but a different last letter (for example, &quot;aaaaaaaaa&quot; for
				text and &quot;aaaab&quot; for pattern), since we will only mismatch on the last
				comparison
			</li>
		</ul>
	),
	BST: (
		<ul>
			<li>To get a degenerate BST, you can add ascending data, such as 1, 2, 3, ...</li>
			<li>To get a full BST, you can add 2, 1, 4, 3, 5, in that order</li>
			<li>To get a complete BST, you can add 3, 2, 4, 1, in that order</li>
			<li>To get a full and complete BST, you can add 4, 2, 5, 1, 3, in that order</li>
		</ul>
	),
	BTree: (
		<ul>
			<li>
				To cause overflow and trigger a promotion, add more than 3 data (for example 1, 2, 3
				and 4)
			</li>
			<li>
				To remove from a leaf node, add 1, 2, 3 and 4, in that order, then remove 3 or 4
			</li>
			<li>
				To remove from an inner node and use the predecessor, add 1, 3, 4, 5 and 2, in that
				order, then remove 3
			</li>
			<li>
				To cause underflow and trigger a rotation/transfer, add 1, 2, 3 and 4, in that
				order, then remove 1
			</li>
			<li>To cause underflow and trigger a fusion, follow the steps above then remove 2</li>
		</ul>
	),
	BubbleSort: (
		<ul>
			<li>The best case is when we have a sorted array (terminates if no swaps are made)</li>
			<li>
				The worst case is when we have a reverse sorted array (we perform
				<p className="equation">
					n + (n - 1) + (n - 2) + ... = n<sup>2</sup>
				</p>
				comparisons)
			</li>
		</ul>
	),
	CocktailSort: (
		<ul>
			<li>The best case is when we have a sorted array (terminates if no swaps are made)</li>
			<li>
				The worst case is when we have a reverse sorted array (we perform
				<p className="equation">
					n + (n - 1) + (n - 2) + ... = n<sup>2</sup>
				</p>
				comparisons)
			</li>
			<li>
				Even though Cocktail Shaker Sort has the same big-O as Bubble Sort, it is still
				faster; one case where it significantly outperforms Bubble Sort is when we have a
				sorted array, except for the last element which is the smallest, for example [2, 3,
				4, 5, 6, 7, 8, 9, 1]
			</li>
		</ul>
	),
	InsertionSort: (
		<ul>
			<li>The best case is when we have a sorted array (terminates if no swaps are made)</li>
			<li>
				The worst case is when we have a reverse sorted array (we perform
				<p className="equation">
					n + (n - 1) + (n - 2) + ... = n<sup>2</sup>
				</p>
				comparisons)
			</li>
		</ul>
	),
	QuickSelect: (
		<ul>
			<li>
				The worst case occurs when we pick a bad pivot everytime (for example, the smallest
				or largest element), since we can no longer subvide the array
			</li>
		</ul>
	),
	QuickSort: (
		<ul>
			<li>
				The worst case occurs when we pick a bad pivot everytime (for example, the smallest
				or largest element), since we can no longer subvide the array and the algorithms
				becomes similar to Selection Sort
			</li>
		</ul>
	),
	SkipList: (
		<ul>
			<li>
				You can get a degenerate SkipList by always adding with a constant amount of heads,
				for example 0 or 4.
			</li>
			<li>
				Note that in a real SkipList, you would have an{' '}
				<span className="inline-eq">O(log n) </span>
				cap to the number of levels, so we wouldn't be able to add the first element with 4
				heads, for example.
			</li>
		</ul>
	),
};
