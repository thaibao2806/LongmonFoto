import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Button,
  notification,
  Card,
  message,
  Table,
  Badge,
} from "antd";
import {
  InfoCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

const { Meta } = Card;

function PhotoSelector() {
  const [driveLink, setDriveLink] = useState("");
  const [imageLinks, setImageLinks] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [username, setUsername] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [urlEnpoint, setUrlEndpoint] = useState("");
  const [id, setId] = useState("");
  const [data, setData] = useState(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [newSelect, setNewSelect] = useState([]);
  const [isModalVisibleCart, setIsModalVisibleCart] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const showCartModal = () => {
    setCartModalVisible(true);
  };

  const handleCartCancel = () => {
    setCartModalVisible(false);
  };

  const column = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Link drive",
      dataIndex: "url",
      key: "url",
    },
    {
      title: "Create date",
      dataIndex: "createDate",
      key: "createDate",
    },

    {
      title: "Link customer",
      dataIndex: "linkCustomer",
      key: "linkCustomer",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <>
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
            style={{ color: "red" }}
          />
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(record.linkCustomer)}
            style={{ color: "blue" }}
          />
        </>
      ),
    },
  ];
  const getlink = async (id) => {
    let res = await axios.get(`https://f1de-202-78-231-138.ngrok-free.app/api/links/${id}`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    });
    if (res) {
      setDriveLink(res.data.url);
      setUsername(res.data.name);
    }
  };

  const getData = async () => {
    let res = await axios.get(`https://f1de-202-78-231-138.ngrok-free.app/api/links`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    });
    if (res) {
      let arr = res.data.map((item, index) => ({
        key: item._id, // Use unique id as key
        name: item.name,
        url: item.url,
        createDate: item.createdAt,
        linkCustomer: `https://longmon-foto-jwj6.vercel.app?id=${item._id}`,
      }));
      setData(arr);
    }
  };

  const handleDelete = async (key) => {
    try {
      await axios.delete(`https://f1de-202-78-231-138.ngrok-free.app/api/links/${key}`, {
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      });
      setData(data.filter((item) => item.key !== key));
      notification.success({
        message: "Success",
        description: "Record deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting record:", error);
      notification.error({
        message: "Error",
        description: "Failed to delete record.",
      });
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    getData();
    if (id) {
      setId(id);
      getlink(id);
      const loadGapiScript = () => {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = () => {
          window.gapi.load("client:auth2", initClient);
        };
        document.body.appendChild(script);
      };

      if (!window.gapi) {
        loadGapiScript();
      } else {
        window.gapi.load("client:auth2", initClient);
      }
    }
  }, []);

  useEffect(() => {
    if (driveLink && username) {
      setTimeout(() => {
        fetchImages();
      }, 1000);
    }
  }, [driveLink, username]);

  const initClient = async () => {
    try {
      await window.gapi.client.init({
        apiKey: "AIzaSyDRR2ViwKGdt4NX8hmVR7bkIYq_8CtAEuk",
        clientId:
          "127196184060-0gbhrgjpte38t7vlrjh42j5cbhdhaarb.apps.googleusercontent.com",
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          "https://sheets.googleapis.com/$discovery/rest?version=v4",
        ],
        scope:
          "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets",
      });

      if (!window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
        await window.gapi.auth2.getAuthInstance().signIn();
      }

      console.log("GAPI client initialized and user signed in.");
    } catch (error) {
      console.error("Error initializing GAPI client:", error);
    }
  };

  const handleInputChange = (event) => {
    setDriveLink(event.target.value);
  };

  const fetchImages = async () => {
    try {
      const folderId = driveLink.match(/[-\w]{25,}/)[0];
      let imageUrls = [];
      let pageToken = null;

      do {
        const response = await window.gapi.client.drive.files.list({
          q: `'${folderId}' in parents and mimeType contains 'image/'`,
          fields:
            "nextPageToken, files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink)",
          pageSize: 100,
          pageToken: pageToken,
        });

        console.log("API Response:", response);

        if (response.result && response.result.files) {
          const files = response.result.files;
          const newImageUrls = files.map((file) => {
            const urlPreview = `https://drive.google.com/file/d/${file.id}/preview`;
            const url = `https://drive.google.com/thumbnail?id=${file.id}`;
            console.log(url);
            return {
              id: file.id,
              name: file.name,
              type: file.mimeType,
              url,
              urlPreview,
              view: file.webViewLink,
            };
          });

          imageUrls = imageUrls.concat(newImageUrls);
          pageToken = response.result.nextPageToken;
        } else {
          console.error("Unexpected API response format:", response.result);
          break;
        }
      } while (pageToken);

      setImageLinks(imageUrls);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const logToSheet = async (image) => {
    try {
      const values = [
        {
          name: image.name.split(".")[0],
          timestamp: new Date().toLocaleString(),
          username: username,
        },
      ];

      console.log(values);

      const response = await axios.post(
        "https://sheet.best/api/sheets/7d77aab1-040e-4728-b907-694614e8befd",
        values
      );

      if (response.status === 200) {
        notification.success({
          message: "Success",
          description: `Image "${image.name}" has been successfully logged.`,
        });
      }

      console.log(response);
    } catch (error) {
      console.error("Error logging to sheet:", error);
      notification.error({
        message: "Error",
        description: `Failed to log image "${image.name}".`,
      });
    }
  };

  const handleSelectClick = (image) => {
    setSelectedImages((prev) => [...prev, image]);
    logToSheet(image);
  };

  const handleImageClick = (url) => {
    setPreviewImage(url);
  };

  const handleModalClose = () => {
    setPreviewImage(null);
  };

  const handleOk = async () => {
    let request = {
      name: username,
      url: driveLink,
    };

    try {
      let response = await axios.post(
        "https://f1de-202-78-231-138.ngrok-free.app/api/links",
        request
      );
      console.log(response);
      if (response) {
        setUrlEndpoint(`https://longmon-foto-jwj6.vercel.app?id=${response.data._id}`);
      }
      getData();
    } catch (error) {
      console.error("Error posting link:", error);
    }
  };

  const handleCopy = (urlEnpoint) => {
    navigator.clipboard
      .writeText(urlEnpoint)
      .then(() => {
        message.success("Copied to clipboard!");
      })
      .catch((err) => {
        message.error("Failed to copy!");
      });
  };

  const handleCancel = () => {
    setUrlEndpoint("");
    setUsername("");
    setDriveLink("");
    setIsModalVisible(false);
  };

  // Function to navigate to next image
  const handleNext = () => {
    if (previewImageIndex < imageLinks.length - 1) {
      const nextIndex = previewImageIndex + 1;
      setPreviewImage(imageLinks[nextIndex].urlPreview);
      setPreviewImageIndex(nextIndex);
    }
  };

  // Function to navigate to previous image
  const handlePrev = () => {
    if (previewImageIndex > 0) {
      const prevIndex = previewImageIndex - 1;
      console.log(prevIndex);
      setPreviewImage(imageLinks[prevIndex].urlPreview);
      setPreviewImageIndex(prevIndex);
    }
  };

  const handleSelect = () => {
    console.log(previewImageIndex)
    if (previewImageIndex !== null) {
      setNewSelect((prevSelect) => [
        ...prevSelect,
        { ...imageLinks[previewImageIndex], urlPreview: previewImage },
      ]);
    }
  };

  const handleDeleteCart = (id) => {
    setNewSelect(newSelect.filter((image) => image.id !== id));
  };

  const handleSendForLong = async () => {
    setLoading(true);
    try {
      await Promise.all(newSelect.map(async (item) => {
        const values = [
          {
            name: item.name.split(".")[0],
            timestamp: new Date().toLocaleString(),
            username: username,
          },
        ];
        const response = await axios.post(
          "https://sheet.best/api/sheets/7d77aab1-040e-4728-b907-694614e8befd",
          values
        );
        if (response.status === 200) {
          notification.success({
            message: "Success",
            description: `Image "${item.name}" has been successfully logged.`,
          });
        }
      }));
      setNewSelect([]); // Clear selected images after successful API call
    } catch (error) {
      console.error("Error logging to sheet:", error);
      notification.error({
        message: "Error",
        description: `Failed to log images.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {data && data.length > 0 && !id ? (
        <>
          <Button
            type="primary"
            style={{ marginTop: "10px", marginBottom: "10px", float: "right" }}
            onClick={() => setIsModalVisible(true)}
          >
            Create link
          </Button>

          <Button
            //type="primary"
            style={{
              marginTop: "10px",
              marginBottom: "10px",
              float: "right",
              marginRight: "10px",
            }}
            //onClick={() => setIsModalVisible(true)}
          >
            <a
              href="https://docs.google.com/spreadsheets/d/11s0v_PdsudmGW8TtFulm-tNFDfAUDVw8Mrm6lTnuM4I/edit?gid=0#gid=0"
              target="_blank"
            >
              View file
            </a>
          </Button>

          <Table dataSource={data} columns={column} rowKey="key"></Table>
        </>
      ) : (
        <>
          <Badge count={newSelect.length} offset={[10, 10]}>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              style={{ marginLeft: "10px", marginBottom: "10px" }}
              onClick={showCartModal}
            >
              Ảnh đã chọn
            </Button>
          </Badge>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: "20px",
              justifyContent: "center",
            }}
          >
            <Modal
              title="Longmon Foto"
              visible={cartModalVisible}
              onCancel={handleCartCancel}
              bodyStyle={{ padding: 0, height: "80vh", overflow:"auto" }} // Remove padding and set height to 100% viewport height
              style={{ top: 0 }} // Align modal to the top
              width="50%" // Set width to 100%
              centered={false} // Remove centering to align with the top
              destroyOnClose={true}
              footer={[
                <Button
                  key="checkout"
                  type="primary"
                  loading={loading}
                  onClick={handleSendForLong}
                >
                  Gửi cho Long
                </Button>,
                <Button key="cancel" onClick={handleCartCancel}>
                  Huỷ
                </Button>,
              ]}
            >
              <div>
                {newSelect.length === 0 ? (
                  <p>No images selected.</p>
                ) : (
                  newSelect.map((image, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        style={{ width: "200px", marginRight: "10px" }}
                      />
                      <p style={{ flex: 1 }}>{image.name}</p>
                      <Button
                        type="danger"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteCart(image.id)}
                        style={{ color: "red" }}
                      ></Button>
                    </div>
                  ))
                )}
              </div>
            </Modal>
            {imageLinks.map((image, index) => (
              <>
                <Card
                  key={index}
                  hoverable
                  style={{ width: 160, margin: "10px" }}
                  cover={
                    <img
                      alt={`img-${index}`}
                      src={image.url}
                      //width="640" height="480" allow="autoplay"
                      onClick={() => handleImageClick(image.urlPreview)}
                    ></img>
                  }
                >
                  <Meta title={image.name} />
                  <Button
                    type="primary"
                    icon={<InfoCircleOutlined />}
                    style={{ marginTop: "10px" }}
                    onClick={() => handleSelectClick(image)}
                    disabled={selectedImages.some((img) => img.id === image.id)}
                  >
                    {selectedImages.some((img) => img.id === image.id)
                      ? "Selected"
                      : "Select"}
                  </Button>
                </Card>
              </>
            ))}
          </div>

          {previewImage && (
            <Modal
              visible={!!previewImage}
              footer={null}
              onCancel={handleModalClose}
              bodyStyle={{ padding: 0, height: "90vh" }} // Remove padding and set height to 100% viewport height
              style={{ top: 0 }} // Align modal to the top
              width="100%" // Set width to 100%
              centered={false} // Remove centering to align with the top
              destroyOnClose={true} // Destroy modal on close to reset state
              footer={[
                <Button onClick={handlePrev} disabled={previewImageIndex === 0}>
                  Previous
                </Button>,
                <Button
                  onClick={handleNext}
                  disabled={previewImageIndex === imageLinks.length - 1}
                >
                  Next
                </Button>,
                <Button
                  type="primary"
                  onClick={handleSelect}
                  disabled={newSelect.some(
                    (img) => img.urlPreview === previewImage
                  )}
                >
                  {newSelect.some((img) => img.urlPreview === previewImage)
                    ? "Selected"
                    : "Select"}
                </Button>,
              ]}
            >
              <iframe
                alt="preview"
                width="99%"
                height="50%"
                allow="autoplay"
                style={{ border: "none", height: "90vh" }}
                src={previewImage}
              ></iframe>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px",
                  position: "absolute",
                  bottom: 0,
                  width: "90%",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                }}
              >
                {/* <Button>Bỏ chọn</Button> */}
              </div>
            </Modal>
          )}
        </>
      )}

      <Modal
        title="Enter Details"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Submit
          </Button>,
          <Button
            key="submit"
            //type="secondary"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(urlEnpoint)}
          >
            Copy URL
          </Button>,
        ]}
      >
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter name customer"
          style={{ marginBottom: "10px" }}
        />
        <Input
          type="text"
          value={driveLink}
          onChange={handleInputChange}
          style={{ marginBottom: "10px" }}
          placeholder="Paste your Google Drive folder link here"
        />
        <Input
          type="text"
          value={urlEnpoint}
          readOnly
          onChange={(e) => setUrlEndpoint(e.target.value)}
          placeholder="URL"
        />
      </Modal>
    </div>
  );
}

export default PhotoSelector;
