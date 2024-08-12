document.getElementById('fetch-button').addEventListener('click', fetchData);
document.getElementById('post-form').addEventListener('submit', createPost);

async function fetchData() {
	renderLoadingState();
	try {
		const postsResponse = await fetch('http://localhost:3004/posts');
		const usersResponse = await fetch('http://localhost:3004/users');

		if (!postsResponse.ok || !usersResponse.ok) {
			throw new Error('Network response was not ok');
		}

		const posts = await postsResponse.json();
		const users = await usersResponse.json();

		// Map userId to userName
		const userMap = {};
		users.forEach((user) => {
			userMap[user.id] = user.name;
		});

		renderData(posts, userMap);
	} catch (error) {
		renderErrorState();
	}
}

async function createPost(event) {
	event.preventDefault(); // Prevent form submission from refreshing the page

	const userId = document.getElementById('user-id').value;
	const title = document.getElementById('title').value;
	const body = document.getElementById('body').value;

	try {
		const response = await fetch('http://localhost:3004/posts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId, title, body }),
		});

		if (!response.ok) {
			throw new Error('Failed to create post');
		}

		// Refresh the list after creating a post
		fetchData();
	} catch (error) {
		console.error('Error creating post:', error);
	}
}

async function deletePost(postId) {
	try {
		const response = await fetch(`http://localhost:3004/posts/${postId}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			throw new Error('Failed to delete post');
		}

		// Refresh the list after deletion
		fetchData();
	} catch (error) {
		console.error('Error deleting post:', error);
	}
}

function renderErrorState() {
	const container = document.getElementById('data-container');
	container.innerHTML = ''; // Clear previous data
	container.innerHTML = '<p>Failed to load data</p>';
	console.log('Failed to load data');
}

function renderLoadingState() {
	const container = document.getElementById('data-container');
	container.innerHTML = ''; // Clear previous data
	container.innerHTML = '<p>Loading...</p>';
	console.log('Loading...');
}

function renderData(posts, userMap) {
	const container = document.getElementById('data-container');
	container.innerHTML = ''; // Clear previous data

	if (posts.length > 0) {
		posts.forEach((post) => {
			const div = document.createElement('div');
			div.className = 'item';
			div.innerHTML = `
        <strong>${userMap[post.userId] || 'Unknown User'}</strong>
        <h4>${post.title}</h4>
        <p>${post.body}</p>
        <button onclick="deletePost('${post.id}')">Delete</button>
      `;
			container.appendChild(div);
		});
	}
}
