import React  from 'react';
import { Layout, Divider, Row, Col, message, Spin } from 'antd';
import Search from 'antd/lib/input/Search';
import { HttpService, PhotoResult } from '../services/HttpService';
import PhotoCard from './PhotoCard/PhotoCard';
import InfiniteScroll from 'react-infinite-scroller';

export interface SearchPageState {
    photoResults: Array<PhotoResult>;
    total: number;
    totalPages: number;
    searchInput: string;
    favoritedPhotoIds: Array<string>;
    loading: boolean;
    hasMore: boolean;
    currentPage: number
}

export interface SearchPageProps {}

class SearchPage extends React.Component<SearchPageProps, SearchPageState> {

    state: SearchPageState = {
        photoResults: [],
        total: 0,
        totalPages: 0,
        searchInput: '',
        favoritedPhotoIds: [],
        loading: false,
        hasMore: true,
        currentPage: 0
    }
    
    componentDidMount() {
        this.setFavoritePhotoIds()
    }

    componentWillReceiveProps() {
       this.setFavoritePhotoIds()
    }

    setFavoritePhotoIds = () => {
        const favPhotoIds = HttpService.GetFavoritedPhotoIds()
        if(favPhotoIds) {
            this.setState({
                favoritedPhotoIds: favPhotoIds
            })
        }
    }

    searchImages = (searchInput: string) => {
        if(searchInput !== this.state.searchInput) {
            HttpService.UnsplashSearchPhoto(searchInput, 1, 10, {orientation: "portrait"}).then((res: any)=>{
                this.setState({
                    photoResults: res.results,
                    total: res.total,
                    totalPages: res.total_pages,
                    currentPage: 1,
                    hasMore: true
                })
            }).catch((err: any)=>{
                message.error("There was an error in searching the images. You have most likely exceeded the number of requests allowed.", 5)
                message.config({maxCount: 1})
            })
        }
        this.setState({
            searchInput: searchInput
        })
    }

    getPhotoCards = () => {
        let photoGroupAmount = 4;
        let photoGroups =this.state.photoResults;
        let photoRows = []
        for(let i = 0; i < this.state.photoResults.length; i+=photoGroupAmount) {
            let photoGroup = photoGroups.slice(i, i+photoGroupAmount);
            photoRows.push(this.getPhotoRow(photoGroup, i));
        }
        return photoRows.map((row)=>{
            return row
        })
    }

    getPhotoRow = (photoGroup: Array<PhotoResult>, index: number) => {
        return(<Row key={`photoRow-${index}`} gutter={[16,16]}>
                    {photoGroup.map((photo, index)=>{
                        return (
                            <Col key={`photoCol-${index}`} span={6} > 
                                <PhotoCard setFavoritePhotoIds={()=>this.setFavoritePhotoIds()} favoritedPhotoIds={this.state.favoritedPhotoIds} photo={photo}/>
                            </Col>
                        )
                    })}
        </Row>)
    }

    handleInfiniteOnLoad = () => {
    let data  = this.state.photoResults;
    this.setState({
        loading: true,
    });
    if (data.length >= this.state.total) {
        this.setState({
        hasMore: false,
        loading: false,
        });
        return;
    }
    HttpService.UnsplashSearchPhoto(this.state.searchInput, this.state.currentPage+1, 10,).then((res: any)=>{
        const joinedResults = this.state.photoResults.concat(res.results)

        this.setState({
            photoResults: joinedResults,
            total: res.total,
            totalPages: res.total_pages,
            currentPage: this.state.currentPage+1,
            loading: false
        })
    }).catch((err: any)=>{
        message.error("There was an error in searching the images. You have most likely exceeded the number of requests allowed.", 5)
        message.config({maxCount: 1})
    })
    };


    render(): JSX.Element {
        return (
            <Layout style={{paddingTop: '20px', paddingLeft: '100px', paddingRight: '100px', paddingBottom: '20px'}}>
                <Search
                    onChange={e=>this.searchImages(e.target.value)}
                    allowClear
                    placeholder="Start typing to search for images"
                    size="large"
                    onSearch={value => this.searchImages(value)}
                />
                <Divider />
                <InfiniteScroll
                    pageStart={0}
                    initialLoad={false}
                    loadMore={()=>this.handleInfiniteOnLoad()}
                    hasMore={!this.state.loading && this.state.hasMore}
                    loader={<></>}
                    useWindow={true}
                >
                    {this.state.photoResults && this.getPhotoCards()}
                </InfiniteScroll> 
                {this.state.searchInput && this.state.hasMore && <Spin size='large' />}
            </Layout>
        )
    }
}

export default SearchPage