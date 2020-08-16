import { message } from 'antd';
const Unsplash = require('unsplash-js').default;
const unsplash = new Unsplash({ accessKey: "lfDzBOpHF2b5Iy0GlEYryskDCGtkJYbgcHQlKBKRFpQ" });

export interface SearchPhoto {
    keyword: string,
    page?: number,
    per_page?: number,
    filters?: Object,
    ['filter.orientation']?: string,
    ['filter.collections']?: Array<any>
}

export interface SearchPhotoResponse {
    results: Array<PhotoResult>;
    total: number;
    total_pages: number;
}

export interface PhotoResult {
    alt_description: string;
    categories: Array<any>; //TODO: categories need typing
    color: string;
    created_at: string;
    current_user_collections: Array<any> //TODO: collection need typing
    description: string;
    height: number;
    id: string;
    liked_by_user: boolean;
    likes: number;
    links: {
        self: string, html: string, download: string, download_location: string
    };
    promoted_at: string;
    sponsorship: any;
    tags: Array<any>; //TODO: PhotoTags need typing
    updated_at: string;
    urls: {raw: string, full: string, regular: string, small: string, thumb: string}
    user: any; //TODO: Needs typing
    width: number;
}

export interface FavoriteList {
    id: string;
    title: string;
    description: string;
    addedPhotoIds: Array<string>;
}

export enum LocalStorageKeys {
    FAVORITE_LISTS = 'favorites',
    FAVORITE_PHOTOS = 'favoritedPhotos'
}

export class HttpService {

    //Simulate backend IDs
    static GenUUID(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    static UnsplashGetPhoto(id: string) {
        return unsplash.photos.getPhoto(id).then((res:any)=>{
            return res.json()
        })
    }

    static UnsplashSearchPhoto(keyword: string, page?: number, per_page?: number, filters?: Object) {
        return unsplash.search.photos(keyword, page, per_page, filters).then((res:any)=>{
            return res.json()
        });
    }

    static async DownloadPhoto(photo: PhotoResult) {
        const response = await fetch(
            photo.urls.regular
        );
        if (response.status === 200) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "image";
            document.body.appendChild(link);
            link.click();
            link.remove();
            return { success: true };
        } else {
            message.error("Failed to download the image.", 5);
            message.config({maxCount: 1});
        }
    }

    static AddFavoriteList(lists: Array<any>) {
        try{
            const stringifiedFavList = JSON.stringify(lists)
            localStorage.setItem(LocalStorageKeys.FAVORITE_LISTS, stringifiedFavList)
        } catch(err) {
            message.error('There was an error in adding the image to these lists.', 5);
            message.config({maxCount: 1});
        }
    }

    static UpdateFavoriteListItem(newListItem: FavoriteList) {
        const lists = HttpService.GetFavoriteLists()
        for(let [index,list] of lists.entries()) {
            if(list.id === newListItem.id) {
                lists.splice(index, 1, newListItem)
                break;
            }
        }
        localStorage.setItem(LocalStorageKeys.FAVORITE_LISTS, JSON.stringify(lists))
    }

    static DeleteFavoriteListItem(id: string) {
        const lists = HttpService.GetFavoriteLists()
        for(let [index,list] of lists.entries()) {
            if(list.id === id) {
                lists.splice(index, 1)
                break;
            }
        }
        localStorage.setItem(LocalStorageKeys.FAVORITE_LISTS, JSON.stringify(lists))
    }

    static GetFavoriteLists() {
        const favLists = localStorage.getItem(LocalStorageKeys.FAVORITE_LISTS);
        if(!favLists){return}
        const favListsParsed = JSON.parse(favLists)
        return favListsParsed
    }

    static GetFavoritedPhotoIds() {
        const favPhotoIds = localStorage.getItem(LocalStorageKeys.FAVORITE_PHOTOS);
        if(favPhotoIds) {
            return JSON.parse(favPhotoIds)
        } 
        return []
    }

    static AddPhotoIdToFavoritedPhotoIds(id: string) {
        const favPhotoIds = HttpService.GetFavoritedPhotoIds()
        const stringifiedFavPhotoIds = JSON.stringify([...favPhotoIds, id])
        localStorage.setItem(LocalStorageKeys.FAVORITE_PHOTOS, stringifiedFavPhotoIds)
    }

    // Can refactor RemovePhotoFromAllLists and RemovePhotoFromList since duplicated code and similar,  if time
    static RemovePhotoFromAllLists(id: string) {
        const favPhotoIds = HttpService.GetFavoritedPhotoIds()
        const favLists = HttpService.GetFavoriteLists()
        let removedFavPhotoIds = favPhotoIds.filter((e: string)=>e !== id)
        for(let list of favLists) {
            if(list.addedPhotoIds.includes(id)) {
                list.addedPhotoIds = list.addedPhotoIds.filter((e: string)=>e !== id);
            }
        }
        localStorage.setItem(LocalStorageKeys.FAVORITE_LISTS, JSON.stringify(favLists))
        localStorage.setItem(LocalStorageKeys.FAVORITE_PHOTOS, JSON.stringify(removedFavPhotoIds))
    }



    // Can refactor RemovePhotoFromAllLists and RemovePhotoFromList since duplicated code and similar,  if time
    static RemovePhotoFromList(photoId: string, listId: string) {
        const favPhotoIds = HttpService.GetFavoritedPhotoIds()
        const favLists = HttpService.GetFavoriteLists()
        let removedFavPhotoIds = favPhotoIds.filter((e: string)=>e !== photoId)
        let idFoundInOtherLists = false
        for(let list of favLists) {
            if(list.addedPhotoIds.includes(photoId) && list.id === listId) {
                list.addedPhotoIds = list.addedPhotoIds.filter((e: string)=>e !== photoId);
            } else if (list.addedPhotoIds.includes(photoId)){
                idFoundInOtherLists = true
            }
        }
        localStorage.setItem(LocalStorageKeys.FAVORITE_LISTS, JSON.stringify(favLists))
        if(!idFoundInOtherLists) {
            localStorage.setItem(LocalStorageKeys.FAVORITE_PHOTOS, JSON.stringify(removedFavPhotoIds))
        }
    }
}