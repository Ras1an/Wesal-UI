
const token = sessionStorage.getItem('authToken');


window.addEventListener('DOMContentLoaded', () => {
  loadLayoutAndContent();
  GetAllFriendRequests();
});

  async function loadLayoutAndContent() {
    try {
        const response1 = await fetch('https://localhost:7204/api/Profile/GetProfile',{
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

   if(response1.ok){
    const profile = await response1.json();

    document.getElementById('user-avatar').src = profile.profilePictureLink;
    document.getElementById('user-name').textContent = profile.name;
    document.getElementById('username').textContent = profile.name;
   }     

   
} catch (error) {
      console.error('Error loading layout:', error);
    }
}




  
async function GetAllFriendRequests() {
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
          <img src="${request.fromFriend.photoLink}" alt="${request.fromFriend.name}" class="rounded-circle me-3" width="40" height="40">
          <div class="flex-grow-1">
            <h6 class="mb-0">${request.fromFriend.name}</h6>
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
}


   function logout() {
    // Remove the token from sessionStorage
    sessionStorage.removeItem('authToken'); // Adjust the key if your token is named differently

    window.location.href = 'http://127.0.0.1:3000/Login.html'; // Change path if needed
  }




