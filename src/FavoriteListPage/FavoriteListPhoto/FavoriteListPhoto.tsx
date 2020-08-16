import React  from 'react';
import { Row, Col, Button,  Popconfirm, Card } from 'antd';
import { PhotoResult, HttpService } from '../../services/HttpService';
import { DownloadOutlined } from '@ant-design/icons';

export interface FavoriteListPhotoState {}

export interface FavoriteListPhotoProps {
    photo: PhotoResult;
    removePhotoFromList: Function;
}

class FavoriteListPhoto extends React.Component<FavoriteListPhotoProps, FavoriteListPhotoState> {

    state: FavoriteListPhotoState = {}

    render(): JSX.Element {
        return (
            <Card>
                <Row>
                    <img height={400} alt="logo" src={this.props.photo.urls.thumb}/>
                </Row>
                <Row>
                    <Col>
                        <Button 
                            onClick={()=>HttpService.DownloadPhoto(this.props.photo)}
                            type="primary" icon={<DownloadOutlined />}
                            size="large"
                            style={{margin: '5px'}}>
                            Download
                        </Button>
                    </Col>
                    <Col>
                        <Popconfirm 
                            placement="topRight"
                            onConfirm={()=>this.props.removePhotoFromList(this.props.photo.id)}
                            okText="Yes"
                            cancelText="No"
                            title="Are you sure you want to remove this photo from the current list?">
                            <Button 
                                style={{margin: '5px'}}
                                type="primary"
                                size="large"
                                danger>
                                    Remove
                            </Button>
                        </Popconfirm>
                    </Col>
                </Row>
            </Card>
        )
    }
}

export default FavoriteListPhoto