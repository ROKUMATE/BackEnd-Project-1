# A Youtube BackEnd Clone

Important points to be covered in this project. [A Production Grade Project]

1. Used Node.js and Expressjs as a helpful hand in this backend project for the server and coding purposes.
2. A create a User, password hashing by bcrypt and using JWT to securely send data between two parties.
3. Creating a video model, and uploading a video on the database created to a user.[I have here used Cloudinary as a system to store my images and the uploaded videos by the user.]
4. Used MongoDB - Aggregation Pipeline for easy access and logic for many of the controllers in the project for example,  the watch history of the user, the total number of subscribers of a user, get the playlist of the user by its id, etc.
5. Added more additional functionality like tweeting (instead of a video a user can public his / her message), commenting on the video or tweet, liking the video, etc.

## Installation

Use the package manager [npm](https://www.npmjs.com) to install all Dependencies and Dev-Dependencies.

```bash
npm install
```

## Usage

For usage, u have to create accounts and a database on these websites:

1. Cloudinary
2. MongoDB

Then u have to create a ```.env``` file [This is the environment variables file]
in the project folder, and then file this whole file in it replacing ```<Text_In_This>``` with the appropriate name and password and the rest things

```
# On which port to run
PORT=<ENTER_YOUR_PORT>

# Setup for MongoDB database
MONGODB_URI=mongodb+srv://Rokum:<password>@cluster0.ivkcmnc.mongodb.net

# * signifies the access from anywhere
CORS_ORIGIN=* 

# JWT TOKEN
ACCESS_TOKEN_SECRET=<ENTER_YOUR_ACCESS_TOKEN_SECRET>
ACCESS_TOKEN_EXPIRY=<ENTER_YOUR_TIME_U_WANT_IT_TO_EXPIRE>
REFRESH_TOKEN_SECRET=<ENTER_YOUR_REFRESH_TOKEN_SECRET>
REFRESH_TOKEN_EXPIRY=<ENTER_YOUR_TIME_U_WANT_IT_TO_EXPIRE>

# Cloudinary info
CLOUDINARY_NAME: <ENTER_YOUR_CLOUDINARY_NAME>
CLOUDINARY_API_KEY: <ENTER_YOUR_CLOUDINARY_API_KEY>
CLOUDINARY_API_SECRET: <ENTER_YOUR_CLOUDINARY_API_SECRET>
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

### Additional Info

The info.txt gives u brief idea abt some of the things that are being used in the project.
