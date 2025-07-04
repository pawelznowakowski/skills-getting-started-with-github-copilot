document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participants section
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `<div class="participants-section"><strong>Participants:</strong><ul class="participants-list" style="list-style-type:none;padding-left:0;">`;
          details.participants.forEach((participant) => {
            participantsHTML += `<li style="display:flex;align-items:center;gap:6px;">
              <span>${participant}</span>
              <button class="delete-participant" data-activity="${name}" data-email="${participant}" title="Unregister" style="background:none;border:none;color:#d32f2f;cursor:pointer;font-size:18px;line-height:1;">&#128465;</button>
            </li>`;
          });
          participantsHTML += `</ul></div>`;
        } else {
          participantsHTML = `<div class="participants-section"><span class="no-participants">No participants yet.</span></div>`;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Spots left:</strong> ${spotsLeft}</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities after successful signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();

  // Add event delegation for delete buttons (fixes issue with dynamic content)
  activitiesList.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-participant')) {
      const btn = event.target;
      const activity = btn.getAttribute('data-activity');
      const email = btn.getAttribute('data-email');
      try {
        const response = await fetch(`/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
        if (response.ok) {
          fetchActivities();
          messageDiv.textContent = `Unregistered ${email} from ${activity}.`;
          messageDiv.className = 'success';
        } else {
          const result = await response.json();
          messageDiv.textContent = result.detail || 'Failed to unregister.';
          messageDiv.className = 'error';
        }
        messageDiv.classList.remove('hidden');
        setTimeout(() => { messageDiv.classList.add('hidden'); }, 5000);
      } catch (error) {
        messageDiv.textContent = 'Failed to unregister. Please try again.';
        messageDiv.className = 'error';
        messageDiv.classList.remove('hidden');
      }
    }
  });
});
