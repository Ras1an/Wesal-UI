
document.addEventListener("DOMContentLoaded", LoadUserData);
    

const token = sessionStorage.getItem('authToken');

async function LoadUserData() {


 try {
    const response = await fetch('https://localhost:7204/api/Post/GetTimeline?page=1&pageSize=10',{
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            
    const response1 = await fetch('https://localhost:7204/api/Profile/GetProfile',{
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

   if(response1.ok){
    const profile = await response1.json();

    document.getElementById('user-avatar').src = profile.photoUrl;
    document.getElementById('user-name').textContent = profile.name;
   document.getElementById('UserPhoto').src = profile.photoUrl;
    document.getElementById('UserPhoto2').src = profile.photoUrl;
    document.getElementById('UserPhoto3').src = profile.photoUrl;
    //CreatePostPhoto
    //document.getElementById('CreatePostPhoto').src = profile.photoUrl;
    document.getElementById('username').textContent = profile.name;

   }        

    const posts = await response.json();

    console.log(posts)
    renderPosts(posts);

  } catch (error) {
    console.error('Error fetching timeline:', error);
  }
  
}

function renderPosts(posts) {

  const container = document.getElementById('post-container');
  container.innerHTML = ''; // Clear existing posts

  posts.forEach(post => {
    let mediaHtml = '';
  if (post.postPhoto && post.postPhoto.startsWith('https://localhost:7204') && post.postPhoto.length > 0) {
    mediaHtml = renderMedia(post);
    }

    const postHTML = `
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex align-items-start">
            <img class="rounded-circle me-3" src="${post.user.photoLink}" alt="${post.user.id}" width="50" height="50" onclick="window.location.href = 'friend-profile.html?id=${post.user.id}';">
            <div class="w-100">
              <div class="d-flex justify-content-between">
                <div>
                  <h5 class="mb-0">${post.user.name}</h5>
                  <small class="text-muted">${post.post_type} • ${post.createdAt}</small>
                </div>
                <div class="dropdown">
                  <span class="dropdown-toggle" data-bs-toggle="dropdown" role="button">
                    <i class="ri-more-fill"></i>
                  </span>
                  <div class="dropdown-menu dropdown-menu-end">
                    <!-- Dropdown items -->
                  </div>
                </div>
              </div>
              <p class="mt-2 mb-0">${post.postText}</p>
             
              ${mediaHtml}

              <div class="comment-area mt-3">
                <!-- Like, comment, share, comments list, comment form -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', postHTML);
  });
}


function renderMedia(post) {
  const url = post.postPhoto?.replace("https://localhost", "http://localhost") || '';
  return url ? `
    <div class="mt-3">
      <img src="${post.postPhoto}" class="img-fluid rounded w-100" alt="media">
    </div>
  ` : '';
}















// Function to handle post creation with photo
async function createPostWithPhoto() {
  // Get the post content
  const postContent = document.querySelector('#post-modal .form-control').value;
  
  // Get the photo file input (we'll need to add this to the HTML)
  const photoInput = document.querySelector('#post-photo-upload');
  const photoFile = photoInput.files[0];
  
  // Validate inputs
  if (!postContent && !photoFile) {
    alert('Please write something or add a photo to post');
    return;
  }

  // Create FormData to send both text and file
  const formData = new FormData();
  if (postContent) formData.append('postText', postContent);
  if (photoFile) formData.append('Image', photoFile);

  try {
    // Show loading state
    const postButton = document.querySelector('#post-modal button[type="submit"]');
    postButton.disabled = true;
    postButton.textContent = 'Posting...';

    // Send to API
    const response = await fetch('https://localhost:7204/api/Post/CreatePost', {
      method: 'POST',
      headers: {
               'Authorization': `Bearer ${token}`
            },
      body: formData,
      // headers are automatically set by browser for FormData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Close modal and reset form on success
    const modal = bootstrap.Modal.getInstance(document.getElementById('post-modal'));
    modal.hide();
    
    // Clear inputs
    document.querySelector('#post-modal .form-control').value = '';
    removePhoto();

    // Show success message
    alert('Post created successfully!');
    
    // You might want to refresh the posts list or add the new post to the DOM
    // refreshPosts();
    
  } catch (error) {
    console.error('Error creating post:', error);
    alert('Failed to create post. Please try again.');
  } finally {
    // Reset button state
    const postButton = document.querySelector('#post-modal button[type="submit"]');
    postButton.disabled = false;
    postButton.textContent = 'Post';
  }
}
// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Modify the photo option to include file input
  const photoOption = document.querySelector('.modal-body li:first-child .bg-soft-primary');
  photoOption.innerHTML = `
    <input type="file" id="post-photo-upload" accept="image/*" style="display: none;">
    <label for="post-photo-upload" style="cursor: pointer; display: flex; align-items: center;">
      <img src="../assets/images/small/07.png" alt="icon" class="img-fluid me-2"> Photo/Video
    </label>
  `;
  
  // Add photo preview functionality with proper sizing
  const photoInput = document.getElementById('post-photo-upload');
  photoInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = function(event) {
        let preview = document.getElementById('photo-preview');
        if (!preview) {
          preview = document.createElement('div');
          preview.id = 'photo-preview';
          preview.style.marginTop = '15px';
          preview.style.maxHeight = '250px'; // Fixed height for preview
          preview.style.overflow = 'hidden'; // Prevent scrolling in preview
          preview.innerHTML = `
            <img src="${event.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px; display: block; object-fit: contain;">
            <button type="button" class="btn btn-sm btn-danger mt-2" onclick="removePhoto()">
              Remove Photo
            </button>
          `;
          // Insert before the post button
          const postButtonContainer = document.querySelector('.modal-body .other-option').parentNode;
          postButtonContainer.insertBefore(preview, document.querySelector('.modal-body button[type="submit"]').parentNode);
        } else {
          preview.querySelector('img').src = event.target.result;
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });
  
  // Attach the create function to the post button
  const postButton = document.querySelector('#post-modal button[type="submit"]');
  postButton.addEventListener('click', createPostWithPhoto);
});

// Function to remove selected photo
function removePhoto() {
  const photoInput = document.getElementById('post-photo-upload');
  photoInput.value = '';
  const preview = document.getElementById('photo-preview');
  if (preview) {
    preview.remove();
  }
}

// Initialize modal with proper sizing
function initModal() {
  const modal = document.getElementById('post-modal');
  if (modal) {
    modal.addEventListener('shown.bs.modal', function() {
      const modalDialog = this.querySelector('.modal-dialog');
      modalDialog.style.maxHeight = '90vh';
      modalDialog.style.overflowY = 'auto';
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initModal);


function setupLoadingButton(buttonId, loadDuration = 2000, callback = null) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (btn.classList.contains('loading')) return; // prevent double click
    btn.classList.add('loading');

    // Wait 2 seconds (loading animation)
    await new Promise(resolve => setTimeout(resolve, loadDuration));

    // Then load data
    await LoadUserData();

    btn.classList.remove('loading');
    
    // Execute callback (scroll to top)
    if (typeof callback === 'function') {
      callback();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupLoadingButton('loadBtn', 800, () => {
    console.log('Loaded!');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});



 function logout() {
    // Remove the token from sessionStorage
    sessionStorage.removeItem('authToken'); // Adjust the key if your token is named differently

    window.location.href = 'http://127.0.0.1:3000/Login.html'; // Change path if needed
  }




// This function creates a single friend request card
function createFriendRequest(name, friendsCount, imageSrc) {
    const container = document.getElementById("friend-requests-container");

    const wrapper = document.createElement("div");
    wrapper.className = "iq-friend-request";

    wrapper.innerHTML = `
        <div class="iq-sub-card iq-sub-card-big d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
                <img class="avatar-40 rounded" src="${imageSrc}" alt="">
                <div class="ms-3">
                    <h6 class="mb-0">${name}</h6>
                    <p class="mb-0">${friendsCount} friends</p>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <a href="javascript:void(0);" class="me-3 btn btn-primary rounded">Confirm</a>
                <a href="javascript:void(0);" class="me-3 btn btn-secondary rounded">Delete Request</a>
            </div>
        </div>
    `;

    container.appendChild(wrapper);
}

// This function loads the requests from the API
async function loadFriendRequests() {
    try {
        const response = await fetch("/api/friend-requests"); // adjust to your actual API URL
        if (response.ok) {
            const data = await response.json(); // use .json() here
            data.forEach(friend => {
                createFriendRequest(friend.name, friend.friendsCount, friend.imageSrc);
            });
        } else {
            console.error("Failed to load friend requests.");
        }
    } catch (error) {
        console.error("Error fetching friend requests:", error);
    }
}

// Call this function on page load or when needed
loadFriendRequests();





document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch('https://localhost:7204/api/Profile/GetAllFriendRequests', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }  
    });

    let requests = [];
    if (response.ok) {
      requests = await response.json();
    }

    const container = document.getElementById('friend-requests-container');
    container.innerHTML = ''; // Clear previous content

    requests.forEach(request => {
      const userElement = document.createElement('div');
      userElement.innerHTML = `
        <div class="d-flex align-items-center p-3 border-bottom">
          <img src="${request.photoUrl}" alt="${request.name}" class="rounded-circle me-3" width="40" height="40">
          <div class="flex-grow-1">
            <h6 class="mb-0">${request.name}</h6>
            <small>${request.requestedAt}</small>
          </div>
          <div>
            <button class="btn btn-sm btn-success me-1 accept-btn" data-id="${request.friendShipRequestId}">Accept</button>
            <button class="btn btn-sm btn-danger decline-btn" data-id="${request.friendShipRequestId}">Decline</button>
          </div>
        </div>
      `;
      
      container.appendChild(userElement);

      // Attach click event to the accept button
      const acceptButton = userElement.querySelector('.accept-btn');
      const declineButton = userElement.querySelector('.decline-btn');
      acceptButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        const requestId = acceptButton.getAttribute('data-id');
        const success = await acceptFriendRequest(requestId);
        if (success) {
          acceptButton.classList.remove('btn-success');
          acceptButton.classList.add('btn-light');
          acceptButton.innerHTML = `<i class="ri-check-line me-1"></i>Now You Are Friends`;
          acceptButton.disabled = true;
          declineButton.style.display = 'none';
        }
      });
    });
  } catch (error) {
    console.error('Failed to confirm friend request:', error);
  }
});

window.addEventListener('DOMContentLoaded', loadFriendRequests);



async function acceptFriendRequest(FriendshipId) {
  try {
    const response = await fetch(`https://localhost:7204/api/Profile/ِAcceptFriendRequest/${FriendshipId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to accept friend request:', error);
    return false;
  }
}

