package kl.socialnetwork.domain.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "post_images")
public class PostImages extends BaseEntity {
    private String imageUrl;
    private LocalDateTime time;
    private Post post;

    public PostImages() {
    }
    @JsonIgnore
    @ManyToOne(optional = false, targetEntity = Post.class)
    @JoinColumn(name = "post_id", referencedColumnName = "id")
    public Post getPost() {
        return this.post;
    }
    public void setPost(Post post) {
        this.post = post;
    }
    @Column(name = "image_url", nullable = false)
    public String getImageUrl() {
        return this.imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @Column(name = "time", nullable = false)
    public LocalDateTime getTime() {
        return this.time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }

}
