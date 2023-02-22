package kl.socialnetwork.domain.models.viewModels.post;

import kl.socialnetwork.domain.entities.Post;

import java.time.LocalDateTime;

public class PostImageViewModel {
    private String imageUrl;
    private LocalDateTime time;
    private String postId;

    public PostImageViewModel() {
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }

    public String getPostId() {
        return postId;
    }

    public void setPostId(String postId) {
        this.postId = postId;
    }
}
