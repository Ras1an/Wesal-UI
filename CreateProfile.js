
async function loadCountries(){
    const token = sessionStorage.getItem('authToken')
    try{
    const response = await fetch('https://localhost:7204/api/Profile/GetCountries',{
      method: 'GET',
      headers:{
        'Authorization': `Bearer ${token}`
      }
    });

    const Data = await response.json();
    const countryDropdown = document.getElementById('countryDropdown')
    Data.forEach(country => {
      const option = document.createElement('option');
      option.value = country.countryId;
      option.textContent = country.countryName;
      countryDropdown.appendChild(option)
    })
        }

      catch(error){
        console.log(error);
      }  

      
}



async function loadCities(){
  const token = sessionStorage.getItem('authToken')
  const countryId = document.getElementById('countryDropdown').value;
  const cityDropdown = document.getElementById('cityDropdown');
  cityDropdown.innerHTML = '<option value="">Select City</option>';


  if(!countryId) return;

  try{
    const response = await fetch(`https://localhost:7204/api/Profile/GetCities/${countryId}`,{
      method: 'GET',
      headers:{
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();

    data.forEach(city => {
      const option = document.createElement('option');
      option.value = city.cityId;
      option.textContent = city.cityName;
      cityDropdown.appendChild(option);
    });
  }

    catch(error){
      console.error('Failed to load cities', error);
    }
  }


window.addEventListener('DOMContentLoaded', loadCountries)

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('userProfileForm').addEventListener('submit', async function(e) {
        e.preventDefault();
      
        const name = document.getElementById('name').value;
        const dob = document.getElementById('dob').value;
        const bio = document.getElementById('bio').value;
        const gender = document.getElementById('gender').value;
        const countryId = document.getElementById('countryDropdown').value;
        const cityId = document.getElementById('cityDropdown').value;
        /* 
        const pictureInput = document.getElementById('picture');
        const pictureFile = pictureInput.files[0];

        let imageUrl = "";
        if (pictureFile) {
          imageUrl = URL.createObjectURL(pictureFile);
          console.log(imageUrl); // This is a temporary local URL you can use in <img src="...">
            }
*/

        const fileInput = document.getElementById('imageInput');
        const file = fileInput.files[0];
        const formData = new FormData();

        formData.append('Name', name);
        formData.append('DateOfBirth', dob);
        formData.append('Bio', bio);
        formData.append('Gender', gender);
        formData.append('CountryId', countryId);
        formData.append('CityId', cityId);
        formData.append('Image', file);


        
        console.log(formData);

        const token = sessionStorage.getItem('authToken');
        try {
            const response = await fetch('https://localhost:7204/api/Profile/CreateProfile', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            console.log("Success", response);
            
           try {
            window.location.href = "/html/index.html";
            } catch (err) {
             console.error("Redirect failed:", err);
              }
        } catch (error) {
            console.log("Error:", error);
        }
    });
});
