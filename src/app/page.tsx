'use client';

import {useEffect, useState, useCallback} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {generateTagsForBookmark} from '@/ai/flows/generate-tags-for-bookmark';
import {toast} from '@/hooks/use-toast';
import {useToast as useToastContext} from '@/hooks/use-toast';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from '@/components/ui/alert-dialog';
import {Edit, Trash2} from 'lucide-react';

interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
}

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export default function Home() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [newBookmarkDescription, setNewBookmarkDescription] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);

  const [selectedBookmarkId, setSelectedBookmarkId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editBookmarkTitle, setEditBookmarkTitle] = useState('');
  const [editBookmarkDescription, setEditBookmarkDescription] = useState('');

  const {dismiss} = useToastContext();

  useEffect(() => {
    const storedBookmarks = localStorage.getItem('bookmarks');
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handleAddBookmark = useCallback(async () => {
    setIsAddingBookmark(true);
    try {
      if (!newBookmarkUrl || !newBookmarkTitle || !newBookmarkDescription) {
        toast({
          title: 'Error',
          description: 'Please fill in all fields.',
          variant: 'destructive',
        });
        return;
      }

      const newId = generateId();
      const tagsResult = await generateTagsForBookmark({
        url: newBookmarkUrl,
        title: newBookmarkTitle,
        description: newBookmarkDescription,
      });

      const newBookmark: Bookmark = {
        id: newId,
        url: newBookmarkUrl,
        title: newBookmarkTitle,
        description: newBookmarkDescription,
        tags: tagsResult.tags,
      };

      setBookmarks(prevBookmarks => [...prevBookmarks, newBookmark]);
      setNewBookmarkUrl('');
      setNewBookmarkTitle('');
      setNewBookmarkDescription('');

      toast({
        title: 'Success',
        description: 'Bookmark added successfully!',
      });
    } catch (error: any) {
      console.error('Error adding bookmark:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add bookmark.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingBookmark(false);
    }
  }, [newBookmarkUrl, newBookmarkTitle, newBookmarkDescription, setBookmarks]);

  const handleDeleteBookmark = useCallback((id: string) => {
    setBookmarks(prevBookmarks => prevBookmarks.filter(bookmark => bookmark.id !== id));
    toast({
      title: 'Success',
      description: 'Bookmark deleted successfully!',
    });
  }, [setBookmarks]);

  const handleOpenEditDialog = useCallback((id: string) => {
    const bookmarkToEdit = bookmarks.find(bookmark => bookmark.id === id);
    if (bookmarkToEdit) {
      setSelectedBookmarkId(id);
      setEditBookmarkTitle(bookmarkToEdit.title);
      setEditBookmarkDescription(bookmarkToEdit.description);
      setIsEditDialogOpen(true);
    }
  }, [bookmarks]);

  const handleEditBookmark = useCallback(() => {
    setBookmarks(prevBookmarks =>
      prevBookmarks.map(bookmark => {
        if (bookmark.id === selectedBookmarkId) {
          return {
            ...bookmark,
            title: editBookmarkTitle,
            description: editBookmarkDescription,
          };
        }
        return bookmark;
      })
    );
    setIsEditDialogOpen(false);
    toast({
      title: 'Success',
      description: 'Bookmark updated successfully!',
    });
  }, [selectedBookmarkId, editBookmarkTitle, editBookmarkDescription, setBookmarks]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">LinkSaver</h1>

      {/* Add Bookmark Section */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Add New Bookmark</CardTitle>
          <CardDescription>Save a new link to your collection.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input
            type="url"
            placeholder="URL"
            value={newBookmarkUrl}
            onChange={e => setNewBookmarkUrl(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Title"
            value={newBookmarkTitle}
            onChange={e => setNewBookmarkTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={newBookmarkDescription}
            onChange={e => setNewBookmarkDescription(e.target.value)}
          />
          <Button onClick={handleAddBookmark} disabled={isAddingBookmark}>
            {isAddingBookmark ? 'Adding...' : 'Add Bookmark'}
          </Button>
        </CardContent>
      </Card>

      {/* Bookmark List Section */}
      <h2 className="text-xl font-semibold mb-2">My Bookmarks</h2>
      <div className="grid gap-4">
        {bookmarks.map(bookmark => (
          <Card key={bookmark.id}>
            <CardHeader>
              <CardTitle>{bookmark.title}</CardTitle>
              <CardDescription>{bookmark.url}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{bookmark.description}</p>
              {bookmark.tags && bookmark.tags.length > 0 && (
                <div className="mt-2">
                  Tags: {bookmark.tags.join(', ')}
                </div>
              )}
            </CardContent>
            <CardContent className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleOpenEditDialog(bookmark.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the bookmark from your list.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      dismiss();
                      handleDeleteBookmark(bookmark.id);
                    }}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Bookmark Dialog */}
      <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Bookmark</AlertDialogTitle>
            <AlertDialogDescription>
              Update the title and description of your bookmark.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogContent className="grid gap-4">
            <Input
              type="text"
              placeholder="Title"
              value={editBookmarkTitle}
              onChange={e => setEditBookmarkTitle(e.target.value)}
            />
            <Textarea
              placeholder="Description"
              value={editBookmarkDescription}
              onChange={e => setEditBookmarkDescription(e.target.value)}
            />
          </AlertDialogContent>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsEditDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditBookmark}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
