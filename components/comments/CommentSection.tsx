"use client";

import { useEffect, useState, useMemo } from "react";
import { useUserStore } from "@/lib/stores/useUserStore";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, ThumbsUp, ThumbsDown, CornerDownLeft, Trash2, Send } from "lucide-react";

export type CommentData = {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  user_id: string;
  is_deleted: boolean;
  profiles: { username: string; avatar_url: string | null };
  comment_votes: { user_id: string; is_upvote: boolean }[];
};

interface CommentSectionProps {
  seriesId?: string;
  chapterId?: string;
}

const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "الآن";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `منذ ${days} يوم`;
  const months = Math.floor(days / 30);
  if (months < 12) return `منذ ${months} شهر`;
  return `منذ ${Math.floor(months / 12)} سنة`;
};

export default function CommentSection({ seriesId, chapterId }: CommentSectionProps) {
  const { user, isAuthModalOpen, setAuthModalOpen } = useUserStore();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "best" | "oldest">("newest");
  
  const supabase = createClient();

  useEffect(() => {
    fetchComments();
  }, [seriesId, chapterId]);

  const fetchComments = async () => {
    setLoading(true);
    let query = supabase
      .from("comments")
      .select(`
        *,
        profiles (username, avatar_url),
        comment_votes (user_id, is_upvote)
      `)
      .order("created_at", { ascending: false });

    if (seriesId) query = query.eq("series_id", seriesId);
    if (chapterId) query = query.eq("chapter_id", chapterId);

    const { data } = await query;
    if (data) setComments(data as any);
    setLoading(false);
  };

  const handlePostComment = async (parentId?: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const content = parentId ? (document.getElementById(`reply-${parentId}`) as HTMLInputElement)?.value : newComment;
    if (!content?.trim()) return;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        user_id: user.id,
        series_id: seriesId || null,
        chapter_id: chapterId || null,
        parent_id: parentId || null,
        content: content.trim(),
      })
      .select(`*, profiles(username, avatar_url), comment_votes(user_id, is_upvote)`)
      .single();

    if (!error && data) {
      setComments((prev) => [data as any, ...prev]);
      if (parentId) {
        setReplyingTo(null);
      } else {
        setNewComment("");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;
    const { error } = await supabase.from("comments").update({ is_deleted: true }).eq("id", id);
    if (!error) {
      setComments(prev => prev.map(c => c.id === id ? { ...c, is_deleted: true } : c));
    }
  };

  const handleVote = async (commentId: string, isUpvote: boolean) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const existingVote = comment.comment_votes.find(v => v.user_id === user.id);
    
    if (existingVote) {
      if (existingVote.is_upvote === isUpvote) {
        // Remove vote
        await supabase.from("comment_votes").delete().eq("comment_id", commentId).eq("user_id", user.id);
        const newVotes = comment.comment_votes.filter(v => v.user_id !== user.id);
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, comment_votes: newVotes } : c));
      } else {
        // Change vote
        await supabase.from("comment_votes").update({ is_upvote: isUpvote }).eq("comment_id", commentId).eq("user_id", user.id);
        const newVotes = comment.comment_votes.map(v => v.user_id === user.id ? { ...v, is_upvote: isUpvote } : v);
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, comment_votes: newVotes } : c));
      }
    } else {
      // Add vote
      await supabase.from("comment_votes").insert({ comment_id: commentId, user_id: user.id, is_upvote: isUpvote });
      const newVotes = [...comment.comment_votes, { user_id: user.id, is_upvote: isUpvote }];
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, comment_votes: newVotes } : c));
    }
  };

  // Organize comments into threads
  const threadedComments = useMemo(() => {
    const rootComments = comments.filter(c => !c.parent_id);
    const replies: Record<string, CommentData[]> = {};
    
    comments.filter(c => c.parent_id).forEach(c => {
      if (!replies[c.parent_id!]) replies[c.parent_id!] = [];
      replies[c.parent_id!].push(c);
    });

    // Sorting root comments
    rootComments.sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      // Best
      const aScore = a.comment_votes.filter(v => v.is_upvote).length - a.comment_votes.filter(v => !v.is_upvote).length;
      const bScore = b.comment_votes.filter(v => v.is_upvote).length - b.comment_votes.filter(v => !v.is_upvote).length;
      return bScore - aScore;
    });

    // Sort replies oldest first typically
    Object.values(replies).forEach(arr => {
      arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

    return { rootComments, replies };
  }, [comments, sortOrder]);

  const CommentBubble = ({ comment, isReply = false }: { comment: CommentData, isReply?: boolean }) => {
    const upvotes = comment.comment_votes.filter(v => v.is_upvote).length;
    const downvotes = comment.comment_votes.filter(v => !v.is_upvote).length;
    const score = upvotes - downvotes;
    const myVote = user ? comment.comment_votes.find(v => v.user_id === user.id)?.is_upvote : undefined;

    return (
      <div className={`flex gap-3 w-full animate-in fade-in ${isReply ? 'mt-4' : 'mt-6'}`}>
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary-900/30 border border-primary-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden text-primary-400 font-bold text-lg">
          {comment.profiles?.avatar_url ? (
            <img src={comment.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            comment.profiles?.username?.charAt(0).toUpperCase() || "?"
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                {comment.profiles?.username || "مستخدم غير معروف"}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                • {timeAgo(comment.created_at)}
              </span>
            </div>
          </div>

          <div className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
            {comment.is_deleted ? (
              <em className="text-gray-500">تم حذف هذا التعليق بواسطة المستخدم.</em>
            ) : (
              comment.content
            )}
          </div>

          {!comment.is_deleted && (
            <div className="flex items-center gap-4 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {/* Votes */}
              <div className="flex items-center bg-black/20 rounded-full border border-[var(--border-color)] overflow-hidden">
                <button 
                  onClick={() => handleVote(comment.id, true)}
                  className={`p-1.5 px-2 hover:bg-[var(--card-hover)] transition-colors ${myVote === true ? '!text-primary-500 !bg-primary-500/10' : ''}`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 font-bold text-xs">{score > 0 ? `+${score}` : score}</span>
                <button 
                  onClick={() => handleVote(comment.id, false)}
                  className={`p-1.5 px-2 hover:bg-[var(--card-hover)] transition-colors ${myVote === false ? '!text-red-500 !bg-red-500/10' : ''}`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reply Button */}
              {!isReply && (
                <button 
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1.5 hover:text-primary-400 transition-colors"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  رد
                </button>
              )}

              {/* Delete Button */}
              {user && user.id === comment.user_id && (
                <button 
                  onClick={() => handleDelete(comment.id)}
                  className="flex items-center gap-1.5 hover:text-red-400 transition-colors mr-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Reply Input */}
          {replyingTo === comment.id && !isReply && (
            <div className="mt-3 flex gap-2 w-full animate-in slide-in-from-top-2">
              <input 
                id={`reply-${comment.id}`}
                autoFocus
                className="flex-1 bg-black/20 border border-[var(--border-color)] outline-none focus:border-primary-500 rounded-xl px-4 py-2 text-sm text-white"
                placeholder="اكتب ردك هنا..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handlePostComment(comment.id);
                  }
                }}
              />
              <button 
                onClick={() => handlePostComment(comment.id)}
                className="btn-primary !p-2 !rounded-xl"
              >
                <Send className="w-4 h-4 flip-rtl" />
              </button>
            </div>
          )}

          {/* Render Replies */}
          {threadedComments.replies[comment.id] && (
            <div className="mt-4 border-r border-[var(--border-color)] pr-4 mr-2">
              {threadedComments.replies[comment.id].map(reply => (
                <CommentBubble key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-8 mt-12 border-t border-[var(--border-color)]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <MessageSquare className="w-5 h-5 text-primary-500" />
          التعليقات <span className="opacity-50 text-sm font-normal">({comments.length})</span>
        </h3>
        
        {/* Sort */}
        <select 
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as any)}
          className="bg-[var(--card-bg)] border border-[var(--border-color)] text-sm rounded-lg px-3 py-1.5 outline-none focus:border-primary-500"
          style={{ color: "var(--text-secondary)" }}
        >
          <option value="newest">الأحدث</option>
          <option value="best">الأفضل (التصويتات)</option>
          <option value="oldest">الأقدم</option>
        </select>
      </div>

      {/* Main Input */}
      <div className="flex gap-3 mb-10 w-full relative">
        <div className="w-10 h-10 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 text-gray-500">
          {user ? (
            <UserIcon className="w-5 h-5" />
          ) : (
            "?"
          )}
        </div>
        <div className="flex-1 relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onClick={() => !user && setAuthModalOpen(true)}
            placeholder={user ? "شاركنا رأيك..." : "قم بتسجيل الدخول لكتابة تعليق..."}
            className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] outline-none focus:border-primary-500 rounded-xl px-4 py-3 text-sm min-h-[100px] resize-y transition-all"
            style={{ color: "var(--text-primary)" }}
          />
          <button 
            onClick={() => handlePostComment()}
            className="absolute bottom-3 left-3 btn-primary !py-1.5 !px-4 text-xs shadow-lg"
            disabled={!newComment.trim()}
          >
            إرسال
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : threadedComments.rootComments.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] text-gray-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>لا توجد تعليقات بعد. كن أول من يشارك رأيه!</p>
          </div>
        ) : (
          threadedComments.rootComments.map(comment => (
            <CommentBubble key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
