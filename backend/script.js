async function sendImage() {
    let fileInput = document.getElementById("fileInput");

    let formData = new FormData();
    formData.append("image", fileInput.files[0]);

    let response = await fetch("http://127.0.0.1:5000/detect", {
        method: "POST",
        body: formData
    });

    let data = await response.json();
    console.log("Faces detected:", data.faces_detected);
}