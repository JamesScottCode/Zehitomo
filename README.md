## How to install
1) run 'npm install'
2) run 'npm start'
3) The project will run in browser at http://localhost:3000

## Development Technologies
-React allows for easy scalibility and resuable components for things such as the image cards.

-Typescript removes a lot of potential issues with plain Javascript

-Ant Design http://https://ant.design/ allows for quick and already organized creation of components


## Design Decisions
-Photo cards are kept uniform for the sake of quick development. This could be changed in the future simlar to https://unsplash.com/ 

-Cards, lists, and popups use the same minimal default theme for clarity.

-Delete functions have an additional small popup to prevent accidental deletes.


## Implementation
-Infinite scroller. This will make one api for a group of 10 images. As you scroll, another api call will be made to get the next group. This prevents unnecessarily large calls, but has a drawback of more calls in general. Please see *Important Notes* below.

-Currently a call is made every change to the search according to the specs. I think this might need a discussion in considering waiting for 1) a space (aka: new word) and/or 2) waiting for the user stop typing. The reason is, if a person wants to search for "cats" they will make uncessary calls for "c" and "ca" bringing up irreleveant images such as "c", "cars", etc. 


## To do:
-Add redux. This will prevent prop drilling and can keep a persistant state across components. For example, currently there is a passed prop 3 layers deep. For an application this small, it's ok, but reducers/selectors would be better for making a scalable application.

-Add responsiveness to the image cards (and other places as needed). For times-sake, the sizes are fixed for desktop, but would not work on mobile. 

-Some typings related to unsplash API need to be made. Currently some objects such as "categories: Array<any>; " can be seen with any. Must go through unsplashse documentation and update the typing.

-Some components can be broken into smaller components for resuablility.

-Add proper navigation.


## Important Notes
-The free version of unsplash limits to 50 calls per hour. The infinite scroll loader means this can quickly reach the limit if there's non-stop scrolling.
