import React  from 'react';
import { Layout } from 'antd';
import HomeHeader from './HomeHeader/HomeHeader';
import SearchPage from '../SearchPage/SearchPage';
import FavoriteListPage from '../FavoriteListPage/FavoriteListPage';

export interface HomeState {
    currentPage: Navigation
}

export interface HomeProps {}

export enum Navigation {
    SEARCH_PAGE = "SearchPage",
    FAVORITE_PAGE = 'FavoritePage'
}

class Home extends React.Component<HomeProps, HomeState> {

    state: HomeState = {
        currentPage: Navigation.SEARCH_PAGE
    }
    
    setHomeState = (obj: any) => {
        this.setState(obj)
    }

    render(): JSX.Element {
        return (
            <Layout>
                <HomeHeader setHomeState={this.setHomeState} />
                {this.state.currentPage === Navigation.SEARCH_PAGE && <SearchPage />}
                {this.state.currentPage === Navigation.FAVORITE_PAGE && <FavoriteListPage />}
            </Layout>
        )
    }
}

export default Home