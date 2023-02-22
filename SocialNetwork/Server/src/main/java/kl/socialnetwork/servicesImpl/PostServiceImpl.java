package kl.socialnetwork.servicesImpl;

import kl.socialnetwork.domain.entities.*;
import kl.socialnetwork.domain.models.bindingModels.post.PostCreateBindingModel;
import kl.socialnetwork.domain.models.serviceModels.PostServiceModel;
import kl.socialnetwork.repositories.*;
import kl.socialnetwork.services.PostService;
import kl.socialnetwork.validations.serviceValidation.services.PostValidationService;
import kl.socialnetwork.validations.serviceValidation.services.StorageService;
import kl.socialnetwork.validations.serviceValidation.services.UserValidationService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import static kl.socialnetwork.utils.constants.ResponseMessageConstants.SERVER_ERROR_MESSAGE;

@Service
@Transactional
public class PostServiceImpl implements PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final RoleRepository roleRepository;
    private final ModelMapper modelMapper;
    private final PostValidationService postValidationService;
    private final UserValidationService userValidationService;

    @Autowired
    StorageService storageService;

    @Autowired
    PostImageRepository postImageRepository;

    @Autowired
    public PostServiceImpl(PostRepository postRepository, UserRepository userRepository, LikeRepository likeRepository, RoleRepository roleRepository, ModelMapper modelMapper, PostValidationService postValidationService, UserValidationService userValidationService) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.likeRepository = likeRepository;
        this.roleRepository = roleRepository;
        this.modelMapper = modelMapper;
        this.postValidationService = postValidationService;
        this.userValidationService = userValidationService;
    }

    @Override
    public boolean createPost(PostCreateBindingModel postCreateBindingModel, MultipartFile[] images) throws Exception {
        if (!postValidationService.isValid(postCreateBindingModel)) {
            throw new Exception(SERVER_ERROR_MESSAGE);
        }

        User loggedInUser = this.userRepository
                .findById(postCreateBindingModel.getLoggedInUserId())
                .filter(userValidationService::isValid)
                .orElseThrow(Exception::new);

        User timelineUser = this.userRepository
                .findById(postCreateBindingModel.getTimelineUserId())
                .filter(userValidationService::isValid)
                .orElseThrow(Exception::new);

        PostServiceModel postServiceModel = new PostServiceModel();
        postServiceModel.setLoggedInUser(loggedInUser);
        postServiceModel.setTimelineUser(timelineUser);
        postServiceModel.setContent(postCreateBindingModel.getContent());
        postServiceModel.setImageUrl(postCreateBindingModel.getImageUrl());
        postServiceModel.setTime(LocalDateTime.now());
        postServiceModel.setLike(new ArrayList<>());
        postServiceModel.setCommentList(new ArrayList<>());

        Post post = this.modelMapper.map(postServiceModel, Post.class);

        Post postSave = this.postRepository.save(post);

        List<String> paths = storageService.uploadFile(images);

        List<PostImages> lstPostImages = new ArrayList<>();

        for(String pathFile:paths){
            PostImages postImages = new PostImages();
            postImages.setPost(postSave);

            LocalDateTime current = LocalDateTime.now();
            postImages.setTime(current);

            postImages.setImageUrl(pathFile);

            lstPostImages.add(postImages);

        }

        postImageRepository.saveAll(lstPostImages);

        if (postValidationService.isValid(post)) {
            return true;
        }
        return false;
    }

    @Override
    public List<PostServiceModel> getAllPosts(String timelineUserId) {
        List<Post> postList = this.postRepository.findAllByTimelineUserIdOrderByTimeDesc(timelineUserId);
        System.out.println(postList);
        return postList
                .stream()
                .map(post -> this.modelMapper
                        .map(post, PostServiceModel.class))
                .peek(postServiceModel -> {
                    List<Comment> commentList = postServiceModel.getCommentList()
                            .stream()
                            .sorted((comment1, comment2) -> {
                                if (comment1.getTime().isAfter(comment2.getTime())) {
                                    return 1;
                                } else if (comment1.getTime().isBefore(comment2.getTime())) {
                                    return -1;
                                }
                                return 0;
                            }).collect(Collectors.toList());

                    postServiceModel.setCommentList(commentList);
                })
                .collect(Collectors.toList());
    }

    @Async
    @Override
    public CompletableFuture<Boolean> deletePost(String loggedInUserId, String postToRemoveId) throws Exception {
        User loggedInUser = this.userRepository.findById(loggedInUserId).orElse(null);
        Post postToRemove = this.postRepository.findById(postToRemoveId).orElse(null);

        if (!userValidationService.isValid(loggedInUser) || !postValidationService.isValid(postToRemove)) {
            throw new Exception(SERVER_ERROR_MESSAGE);
        }

        UserRole rootRole = this.roleRepository.findByAuthority("ROOT");
        boolean hasRootAuthority = loggedInUser.getAuthorities().contains(rootRole);
        boolean isPostCreator = postToRemove.getLoggedInUser().getId().equals(loggedInUserId);
        boolean isTimeLineUser = postToRemove.getTimelineUser().getId().equals(loggedInUserId);

        if (hasRootAuthority || isPostCreator || isTimeLineUser) {
            try {
                this.postRepository.delete(postToRemove);
                return CompletableFuture.completedFuture(true);
            } catch (Exception e) {
                throw new Exception(SERVER_ERROR_MESSAGE);
            }
        } else {
            throw new Exception(SERVER_ERROR_MESSAGE);
        }
    }
}
