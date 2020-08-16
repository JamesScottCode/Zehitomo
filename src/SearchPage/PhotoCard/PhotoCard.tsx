import React  from 'react';
import { Card, Skeleton, Row, Button, Popover } from 'antd';
import { PhotoResult, HttpService } from '../../services/HttpService';
import { DownloadOutlined, StarTwoTone } from '@ant-design/icons';
import Modal from 'antd/lib/modal/Modal';
import AddFavorite from '../../AddFavorite/AddFavorite';

export interface PhotoCardState {
    isHovered: boolean;
    showAddFavoriteModal: boolean;
}

export interface PhotoCardProps {
    photo: PhotoResult;
    favoritedPhotoIds: Array<string>;
    setFavoritePhotoIds: Function
}

class PhotoCard extends React.Component<PhotoCardProps, PhotoCardState> {

    state: PhotoCardState = {
        isHovered: false,
        showAddFavoriteModal: false,
    }

    isFavorited = () => {
        return this.props.favoritedPhotoIds.includes(this.props.photo.id)
    }

    favUnfavClicked = () => {
        if(this.isFavorited()) {
            HttpService.RemovePhotoFromAllLists(this.props.photo.id)
            this.props.setFavoritePhotoIds()
        } else {
            this.setState({showAddFavoriteModal: true})
        }
    }

    closeAddFavorite = () => {
        this.setState({
            showAddFavoriteModal: false
        })
        this.props.setFavoritePhotoIds()
    }

    render(): JSX.Element {
        return (
            <Card
                onMouseEnter={()=>{this.setState({isHovered: true})}}
                onMouseLeave={()=>{this.setState({isHovered: false})}}
                hoverable
                style={{padding: '10px'}}
                >
                    {!this.props.photo &&  <Skeleton.Image />}

                    {this.props.photo && <>
                        {this.state.isHovered && 
                            <Row style={{position: "absolute", top: '5px', right: '10px'}}>
                                <Button 
                                    onClick={()=>HttpService.DownloadPhoto(this.props.photo)}
                                    type="primary" icon={<DownloadOutlined />}
                                    size="small"
                                    style={{margin: '5px'}}>
                                    Download
                                </Button>
                                <Popover content={this.isFavorited() ? 'This will remove the photo from all lists' : 'Favorite and add to lists'} title="" trigger="hover">
                                    <Button 
                                        onClick={()=>this.favUnfavClicked()}
                                        type="primary"
                                        icon={ <StarTwoTone twoToneColor={this.isFavorited() ? '#FFEC00' : '#FFFFFF'} size={28} />}
                                        size="small"
                                        style={{margin: '5px'}}>
                                            {this.isFavorited() ? 'Favorited' : 'Favorite?'}
                                    </Button>
                                </Popover>
                            </Row>}
                        <Row>
                            <img src={this.props.photo.urls.small} style={{maxWidth: '100%', height: 'auto',}} />
                        </Row>
                        <Row style={{position: "absolute", bottom: '5px'}}>
                            {this.state.isHovered && this.props.photo.user?.portfolio_url ? 
                                <a onClick={()=> window.open(`${this.props.photo.user.portfolio_url}`, "_blank")}>
                                    {`${this.props.photo.user.first_name} ${this.props.photo.user.last_name}'s Portfolio`}
                                </a> : this.state.isHovered && 'No user portfolio.'}
                        </Row>
                    </>}
                    <Modal
                        width={1000}
                        visible={this.state.showAddFavoriteModal}
                        title="Add photo to list"
                        onCancel={()=>this.closeAddFavorite()}
                        footer={<></>}
                    >
                        <AddFavorite closeAddFavorite={()=>this.closeAddFavorite()} photo={this.props.photo} />
                    </Modal>
            </Card>
        )
    }
}

export default PhotoCard