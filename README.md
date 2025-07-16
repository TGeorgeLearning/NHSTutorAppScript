# NHSTutorAppScript
This project is about a Google Apps Script that can be easily implemented into a school's NHS System, as designed to improve efficiency for Chatham High School's NHS Tutor Pairing system.

# How to Set up
First, create a tutor sign-up form with the following format:
<img width="778" height="1081" alt="Screenshot 2025-07-16 at 12 07 57 PM" src="https://github.com/user-attachments/assets/ee6feb08-c9b3-4213-8aab-2362b3fad2ee" />
Of course, you can add on more subjects. 

Now, with the form created, copy the id of the form into the corresponding ID slot in the apps script. After this, make a new form for the parents to select a tutor from. This form can be blank, as the scrip will fill in the form for you.
When you set the triggers for the parent form to be updated, it is recommended that you set it to be updated after a certain time interval (every 2 hours, for example), as if it is updated every time someone submits the tutor sign-up form, two people submitting the form will result in the script not functioning properly.
Make sure to link the corresponding spreadsheets as well!
