
document.addEventListener("DOMContentLoaded", LoadProfileData);
    

const token = sessionStorage.getItem('authToken');



async function LoadProfileData() {

     const queryString = window.location.search; // Gets "?id=123"
     const urlParams = new URLSearchParams(queryString); // Initialize URLSearchParams
     const userId = urlParams.get('id'); // Extracts "123"
    
      if (!userId) {
     console.error("No user ID in URL");
        return;
        }

 try {
    const response = await fetch(`https://localhost:7204/api/Profile/GetUserProfile?userId=${userId}`,{
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            
  let profile;
   if(response.ok){
    profile = await response.json();
    document.getElementById('UserPhoto').src = profile.photoUrl;
        document.getElementById('photoSidebar').src = profile.photoUrl;
        //document.getElementById('userPhotoCreatePost').src = profile.photoUrl;
                document.querySelectorAll('.user-name').forEach(el => {
                el.textContent = profile.name;
            });

   }    

   
       const response1 = await fetch(`https://localhost:7204/api/Post/GetAllUserPosts?userId=${userId}`,{
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });


    const posts = await response1.json();

    console.log(posts)
    renderPosts(profile ,posts);

  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
  
}

function renderPosts(profile ,posts) {
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
            <img class="rounded-circle me-3" src="${profile.photoUrl}" alt="${profile.name}" width="50" height="50">
            <div class="w-100">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="mb-0">${profile.name}</h6>
                  <small class="text-muted">${post.postId} • ${post.createdAt}</small>
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


//https://localhost:7204/api/Profile/GetAllFriends


 function loadFriends(friends) {
    const container = document.getElementById("friendsContainer");
    container.innerHTML = ""; // Clear previous

    friends.forEach((friend, index) => {
      const friendBlock = `
        <div class="col-md-6 col-lg-6 mb-3">
          <div class="iq-friendlist-block">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <a href="#"><img src="${friend.photoUrl}" alt="profile-img" class="img-fluid"></a>
                <div class="friend-info ms-3">
                  <h5>${friend.name}</h5>
                  <p class="mb-0">${friend.friendCount} friends</p>
                </div>
              </div>
              <div class="card-header-toolbar d-flex align-items-center">
                <div class="dropdown">
                  <span class="dropdown-toggle btn btn-secondary me-2" id="dropdownMenuButton${index}" data-bs-toggle="dropdown" aria-expanded="true" role="button">
                    <i class="ri-check-line me-1 text-white"></i> Friend
                  </span>
                  <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton${index}">
                    <a class="dropdown-item" href="#">Get Notification</a>
                    <a class="dropdown-item" href="#">Close Friend</a>
                    <a class="dropdown-item" href="#">Unfollow</a>
                    <a class="dropdown-item" href="#">Unfriend</a>
                    <a class="dropdown-item" href="#">Block</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      container.insertAdjacentHTML('beforeend', friendBlock);
    });
  }



document.addEventListener("DOMContentLoaded", async () => {
    
 try {
    
     const queryString = window.location.search; // Gets "?id=123"
     const urlParams = new URLSearchParams(queryString); // Initialize URLSearchParams
     const userId = urlParams.get('id'); // Extracts "123"
    
    const response = await fetch(`https://localhost:7204/api/Profile/GetAllUserFriends?userId=${userId}`,{
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if(response.ok){
                  const friends = await response.json();        
                
                loadFriends(friends);
            }
  } catch (error) {
    console.error('Error fetching user friends:', error);
  }
  
  });

