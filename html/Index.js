
// Consolidated DOMContentLoaded event
window.addEventListener('DOMContentLoaded', () => {
  CreatePostLayout();
  LoadUserData();
  initModal();
  setupLoadingButton('loadBtn', 800, () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  setupEmojiPopup();
  setupPhotoUploadHandlers();
  loadFriendRequests();
});


async function CreatePostLayout() {
  try {
    const response1 = await fetch('https://localhost:7204/api/Profile/GetProfile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (response1.ok) {
      const profile = await response1.json();
      ['UserPhoto', 'UserPhoto2', 'UserPhoto3'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.src = profile.profilePictureLink;
      });
    }
  } catch (error) {
    console.error('Error loading layout:', error);
  }
}

async function LoadUserData() {
  try {
    const response = await fetch('https://localhost:7204/api/Profile/GetTimeline?page=1&pageSize=10', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    const posts = await response.json();
    renderPosts(posts);
    setupLikeButtons();
  } catch (error) {
    console.error('Error fetching timeline:', error);
  }
}
function renderPosts(posts) {
  const container = document.getElementById('post-container');
  container.innerHTML = '';

  posts.forEach(post => {
    const mediaHtml = post.postPhoto && post.postPhoto.startsWith('https://localhost:7204') ? renderMedia(post) : '';

    const dateObj = new Date(post.createdAt);
    const date = dateObj.toLocaleDateString();
    const time = dateObj.toLocaleTimeString();

    const postHTML = `
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex align-items-start">
            <img class="rounded-circle me-3" src="${post.user.photoLink}" alt="${post.user.id}" width="50" height="50" onclick="window.location.href = 'friend-profile.html?id=${post.user.id}';">
            <div class="w-100">
              <div class="d-flex justify-content-between">
                <div>
                  <h5 class="mb-0">${post.user.name}</h5>
                  <small class="text-muted">${time} ${date}</small>
                </div>
                <div class="dropdown">
                  <span class="dropdown-toggle" data-bs-toggle="dropdown" role="button">
                    <i class="ri-more-fill"></i>
                  </span>
                  <div class="dropdown-menu dropdown-menu-end"></div>
                </div>
              </div>
              <p class="mt-2 mb-0">${post.postText ?? ''}</p>
              ${mediaHtml}
              <!-- Start Comments Section -->
              <div class="comment-area mt-3">
                <div class="d-flex justify-content-between align-items-center flex-wrap">
                  <div class="like-block position-relative d-flex align-items-center">
                    <div class="d-flex align-items-center">
                      <div class="like-data">
                        <div class="dropdown">
                          <span class="dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" role="button">
                            <img src="assets/images/icon/01.png" class="img-fluid" alt="">
                          </span>
                          <div class="dropdown-menu py-2">
                              <a class="me-2" href="#"><img src="assets/images/icon/01.png" class="img-fluid" alt=""></a>
                          </div>
                        </div>
                      </div>
                      <div class="total-like-block ms-2 me-3">
                        <div class="dropdown">
                          <span class="dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" role="button">${post.likes.length} Likes</span>
                          <div class="dropdown-menu">
                            <a class="dropdown-item" href="#">Sample User</a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="total-comment-block">
                      <div class="dropdown">
                        <span class="dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" role="button">${post.comments.length} Comment</span>
                        <div class="dropdown-menu">
                          <a class="dropdown-item" href="#">Sample Commenter</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="share-block d-flex align-items-center feather-icon mt-2 mt-md-0">
                    <a href="javascript:void(0);" data-bs-toggle="offcanvas" data-bs-target="#share-btn" aria-controls="share-btn">
                      <i class="ri-share-line"></i><span class="ms-1">99 Share</span>
                    </a>
                  </div>
                </div>
                <hr>
                <ul class="post-comments list-inline p-0 m-0" id="comments-${post.postId}"></ul>
                <form class="comment-form d-flex align-items-center mt-3" data-post-id="${post.postId}">
                  <input type="text" class="comment-input form-control rounded" placeholder="Enter Your Comment">
                  <button type="submit" class="btn btn-primary ms-2">Comment</button>
                </form>
              </div>
              <!-- End Comments Section -->
            </div>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', postHTML);

    // Render comments
    if (post.comments && Array.isArray(post.comments)) {
      const commentList = document.getElementById(`comments-${post.postId}`);
      post.comments.forEach(comment => {
        const commentTemplate = document.getElementById('comment-template');
        const clone = commentTemplate.content.cloneNode(true);

        clone.querySelector('.comment-user-img').src = comment.user.photoLink;
        clone.querySelector('.comment-user-img').alt = comment.user.name;
        clone.querySelector('.comment-user-name').textContent = comment.user.name;
        clone.querySelector('.comment-text').textContent = comment.commentText;
        clone.querySelector('.comment-time').textContent = new Date(comment.createdAt).toLocaleTimeString();

        commentList.appendChild(clone);
      });
    }

    // Setup comment form submission for this post
    const commentForm = container.querySelector(`.comment-form[data-post-id="${post.postId}"]`);
    if (commentForm) {
      commentForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const input = this.querySelector('.comment-input');
        const commentText = input.value.trim();
        if (!commentText) return;


        try {
          const response = await fetch('https://localhost:7204/api/Comment/CreateComment', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            PostId: post.postId,
            CommentText: commentText
             })
          });

          if (response.ok) {
            const newComment = await response.json();
            input.value = '';

            const commentList = document.getElementById(`comments-${post.postId}`);
            const commentTemplate = document.getElementById('comment-template');
            const clone = commentTemplate.content.cloneNode(true);

            clone.querySelector('.comment-user-img').src = newComment.user.photoLink;
            clone.querySelector('.comment-user-img').alt = newComment.user.name;
            clone.querySelector('.comment-user-name').textContent = newComment.user.name;
            clone.querySelector('.comment-text').textContent = newComment.commentText;
            clone.querySelector('.comment-time').textContent = new Date(newComment.createdAt).toLocaleTimeString();

            commentList.appendChild(clone);
          } else {
            console.error('Failed to save comment');
          }
        } catch (err) {
          console.error('Error submitting comment:', err);
        }
      });
    }

  });
}


function setupLikeButtons() {
  document.querySelectorAll('.like-button').forEach(button => {
    button.addEventListener('click', () => {
      const postId = button.getAttribute('data-post-id');
      const type = button.getAttribute('data-type');
      handleLike(postId, type);
    });
  });
}



function renderMedia(post) {
  const url = post.postPhoto?.replace("https://localhost", "http://localhost") || '';
  return url ? `<div class="mt-3"><img src="${post.postPhoto}" class="img-fluid rounded w-100" alt="media"></div>` : '';
}

async function createPostWithPhoto() {
  const postContent = document.querySelector('#post-content textarea').value;
  const photoInput = document.querySelector('#post-photo-upload');
  const photoFile = photoInput.files[0];

  if (!postContent && !photoFile) {
    alert('Please write something or add a photo to post');
    return;
  }

  const formData = new FormData();
  if (postContent) formData.append('postText', postContent);
  if (photoFile) formData.append('Image', photoFile);

  const postButton = document.querySelector('#submit-post');
  postButton.disabled = true;
  postButton.textContent = 'Posting...';

  try {
    const response = await fetch('https://localhost:7204/api/Post/CreatePost', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    document.querySelector('#post-content').value = '';
    removePhoto();
    alert('Post created successfully!');
  } catch (error) {
    console.error('Error creating post:', error);
    alert('Failed to create post. Please try again.');
  } finally {
    postButton.disabled = false;
    postButton.textContent = 'Post';
    document.querySelector('#post-content textarea').value = "";
  }

}

function removePhoto() {
  const photoInput = document.getElementById('post-photo-upload');
  const preview = document.getElementById('image-preview');
  photoInput.value = '';
  if (preview) {
    preview.innerHTML = '';
    preview.style.display = 'none';
  }
}

function initModal() {
  const modal = document.getElementById('post-modal');
  if (modal) {
    modal.addEventListener('shown.bs.modal', function () {
      const modalDialog = this.querySelector('.modal-dialog');
      modalDialog.style.maxHeight = '90vh';
      modalDialog.style.overflowY = 'auto';
    });
  }
}

function setupLoadingButton(buttonId, loadDuration = 2000, callback = null) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.addEventListener('click', async () => {
    if (btn.classList.contains('loading')) return;
    btn.classList.add('loading');
    await new Promise(resolve => setTimeout(resolve, loadDuration));
    await LoadUserData();
    btn.classList.remove('loading');
    if (typeof callback === 'function') callback();
  });
}

function setupEmojiPopup() {
  const emojiToggle = document.getElementById('emoji-toggle');
  const emojiPopup = document.getElementById('emoji-popup');
  const textArea = document.querySelector('#post-content textarea');

  if (!emojiToggle || !emojiPopup || !textArea) return;

  emojiToggle.addEventListener('click', function () {
    emojiPopup.style.display = emojiPopup.style.display === 'none' ? 'block' : 'none';
    const rect = emojiToggle.getBoundingClientRect();
    emojiPopup.style.top = `${rect.bottom + window.scrollY}px`;
    emojiPopup.style.left = `${rect.left + window.scrollX}px`;
  });

  emojiPopup.addEventListener('click', function (e) {
    if (e.target.classList.contains('emoji')) {
      insertAtCursor(textArea, e.target.textContent);
      //emojiPopup.style.display = 'none';
    }
  });

  function insertAtCursor(input, emoji) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    input.value = text.substring(0, start) + emoji + text.substring(end);
    input.focus();
    input.selectionStart = input.selectionEnd = start + emoji.length;
  }

  document.addEventListener('click', function (e) {
    if (!emojiPopup.contains(e.target) && !emojiToggle.contains(e.target)) {
      emojiPopup.style.display = 'none';
    }
  });
}

function setupPhotoUploadHandlers() {
  const input = document.getElementById('post-photo-upload');
  input?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        let preview = document.getElementById('image-preview');
        preview.innerHTML = `
          <img src="${event.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
          <button type="button" class="btn btn-sm btn-danger mt-2" style = "background-color:red;"onclick="removePhoto()">Remove Photo</button>
        ;`
        preview.style.display = 'block';
      };
    reader.readAsDataURL(file);
  });

  document.getElementById('submit-post')?.addEventListener('click', createPostWithPhoto);
}
async function acceptFriendRequest(id) {
  try {
    const response = await fetch(`https://localhost:7204/api/Profile/ِAcceptFriendRequest/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to accept friend request:', error);
    return false;
  }
}

function logout() {
  sessionStorage.removeItem('authToken');
  window.location.href = 'http://127.0.0.1:3000/Login.html';
}








