package kl.socialnetwork.services;

import kl.socialnetwork.domain.models.bindingModels.post.PostCreateBindingModel;
import kl.socialnetwork.domain.models.serviceModels.PostServiceModel;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface PostService {
    boolean createPost(PostCreateBindingModel postCreateBindingModel, MultipartFile[] images) throws Exception;

    List<PostServiceModel> getAllPosts(String timelineUserId);

    CompletableFuture<Boolean> deletePost(String loggedInUserId, String postToRemoveId) throws Exception;
}
