const token = sessionStorage.getItem('authToken');

async function loadSuggestedFriends() {
  try {
    const response = await fetch('https://localhost:7204/api/Profile/SuggestFriends', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    let friends = [];
    if (response.ok) {
      friends = await response.json();
    }

    const container = document.getElementById('suggested-friends');
    container.innerHTML = ''; // Clear existing content

    friends.forEach(friend => {
      const friendItem = document.createElement('li');
      friendItem.className = 'd-flex align-items-center flex-wrap';

      friendItem.innerHTML = `
        <div class="user-img img-fluid flex-shrink-0" style="width: 100px; height: 100px; overflow: hidden; border-radius: 50%;">
          <img src="${friend.photoUrl}" alt="story-img" class="rounded-circle avatar-40" style="width: 100px; height: 100px; padding: 15px;">
        </div>
        <div class="flex-grow-1 ms-3">
          <h6>${friend.name}</h6>
          <p class="mb-0">${friend.mutualFriends || '0'} friends</p>
        </div>
        <div class="d-flex align-items-center mt-2 mt-md-0">
          <button class="me-3 btn btn-primary rounded add-friend-btn" data-id="${friend.id}">
            <i class="ri-user-add-line me-1"></i>Add Friend
          </button>
          <a href="#" class="btn btn-secondary rounded" data-extra-toggle="delete" data-closest-elem=".item">Remove</a>
        </div>
      `;

      // Append the item
      container.appendChild(friendItem);

      // ✅ Attach click event to the button inside this friendItem
      const addButton = friendItem.querySelector('.add-friend-btn');
      addButton.addEventListener('click', async () => {
        const userId = addButton.getAttribute('data-id');
        const success = await sendFriendRequest(userId);
        if (success) {
          addButton.classList.remove('btn-primary');
          addButton.classList.add('btn-light');
          addButton.innerHTML = `<i class="ri-check-line me-1"></i>Request Sent`;
          addButton.disabled = true;
        }
      });
    });
  } catch (error) {
    console.error('Failed to load friend suggestions:', error);
  }
}


// Call on page load
window.addEventListener('DOMContentLoaded', loadSuggestedFriends);

// Send friend request
async function sendFriendRequest(userId) {
  try {
    const response = await fetch(`https://localhost:7204/api/Profile/SendFriendShipRequest/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send friend request:', error);
    return false;
  }
}



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








   document.addEventListener("DOMContentLoaded", async function () {
    try{
      const response = await fetch('https://localhost:7204/api/Profile/GetAllFriendRequests',{
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }  
      });

      let requests =[]
          if (response.ok) {
      requests = await response.json();
    }

    const container = document.getElementById('friend-requests');
    container.innerHTML = ''; // Clear existing content

    requests.forEach(request => {
      const friendItem = document.createElement('li');
      friendItem.className = 'd-flex align-items-center flex-wrap';

      friendItem.innerHTML = `
        <div class="user-img img-fluid flex-shrink-0" style="width: 100px; height: 100px; overflow: hidden; border-radius: 50%;">
          <img src="${request.photoUrl}" alt="story-img" class="rounded-circle avatar-40" style="width: 100px; height: 100px; padding: 15px;">
        </div>
        <div class="flex-grow-1 ms-3">
          <h6>${request.name}</h6>
          <p class="mb-0">${request.mutualFriends || '0'} friends</p>
        </div>
        <div class="d-flex align-items-center mt-2 mt-md-0">
          <button class="me-3 btn btn-primary rounded add-friend-btn" data-id="${request.friendShipRequestId}">
            <i class="ri-user-add-line me-1"></i>Confirm
          </button>
          <a href="#" class="btn btn-secondary rounded" data-extra-toggle="delete" data-closest-elem=".item">Remove</a>
        </div>
      `;

      // Append the item
      container.appendChild(friendItem);

      // ✅ Attach click event to the button inside this friendItem
      const addButton = friendItem.querySelector('.add-friend-btn');
      addButton.addEventListener('click', async () => {
        const requestId = addButton.getAttribute('data-id');
        const success = await acceptFriendRequest(requestId);
        if (success) {
          addButton.classList.remove('btn-primary');
          addButton.classList.add('btn-light');
          addButton.innerHTML = `<i class="ri-check-line me-1"></i>Now You Are Friends`;
          addButton.disabled = true;
        }
      });
    });
  } catch (error) {
    console.error('Failed to confirm friend request:', error);
  }
})

