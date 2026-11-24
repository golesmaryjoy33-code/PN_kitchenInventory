
document.addEventListener("DOMContentLoaded", function () {
    const changeProfileBtn = document.getElementById("changeProfileBtn");
    const profileImageInput = document.getElementById("profileImageInput");

    const userAvatar = document.getElementById("userAvatar");
    const dropdownAvatar = document.getElementById("dropdownAvatar");

    const dropdownFullName = document.getElementById("dropdownFullName");
    const dropdownUsername = document.getElementById("dropdownUsername");

    // Get the username of the currently logged-in user
    function getCurrentUsername() {
        return dropdownUsername.textContent
            .trim()
            .replace("@", "")
            .toLowerCase();
    }

    // Display the correct profile picture for an account
    function loadProfilePicture(username) {
        if (!username) return;

        const savedPicture = localStorage.getItem(
            "profilePicture_" + username.toLowerCase()
        );

        const fullName = dropdownFullName.textContent.trim();
        const initial = fullName ? fullName.charAt(0).toUpperCase() : "?";

        [userAvatar, dropdownAvatar].forEach(function (avatar) {
            if (!avatar) return;

            if (savedPicture) {
                avatar.style.backgroundImage = `url("${savedPicture}")`;
                avatar.textContent = "";
            } else {
                avatar.style.backgroundImage = "none";
                avatar.textContent = initial;
            }
        });
    }

    // Make this function available to your login system
    window.loadProfilePicture = loadProfilePicture;

    // Open the computer's photo/file picker
    if (changeProfileBtn && profileImageInput) {
        changeProfileBtn.addEventListener("click", function () {
            profileImageInput.click();
        });

        profileImageInput.addEventListener("change", function () {
            const file = profileImageInput.files[0];

            if (!file) return;

            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                alert("Please select a JPG, PNG, or WEBP image.");
                profileImageInput.value = "";
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                alert("Image must not exceed 2 MB.");
                profileImageInput.value = "";
                return;
            }

            const username = getCurrentUsername();

            if (!username) {
                alert("Please log in first.");
                return;
            }

            const reader = new FileReader();

            reader.onload = function (event) {
                const imageData = event.target.result;

                // Save the image under the current user's account
                localStorage.setItem(
                    "profilePicture_" + username,
                    imageData
                );

                loadProfilePicture(username);
            };

            reader.readAsDataURL(file);
            profileImageInput.value = "";
        });
    }
});
